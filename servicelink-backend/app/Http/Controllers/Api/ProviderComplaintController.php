<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProviderComplaintResponseRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class ProviderComplaintController extends Controller
{
    private function jsonResponse(
        bool $success,
        string $message,
        mixed $data = null,
        mixed $errors = null,
        int $status = 200
    ): JsonResponse {
        return response()->json([
            'success' => $success,
            'message' => $message,
            'data' => $data,
            'errors' => $errors,
        ], $status);
    }

    private function findProvider(
        string $providerPublicId
    ): ?object {
        return DB::table('users')
            ->where(
                'public_id',
                $providerPublicId
            )
            ->where('role', 'provider')
            ->first();
    }

    private function createResponsePublicId(): string
    {
        do {
            $publicId =
                'CR-' . strtoupper(
                    Str::random(10)
                );
        } while (
            DB::table('complaint_responses')
                ->where(
                    'public_id',
                    $publicId
                )
                ->exists()
        );

        return $publicId;
    }

    private function baseComplaintQuery(
        int $providerId
    ) {
        return DB::table('complaints')
            ->join(
                'users as complainants',
                'complaints.complainant_id',
                '=',
                'complainants.id'
            )
            ->leftJoin(
                'bookings',
                'complaints.booking_id',
                '=',
                'bookings.id'
            )
            ->leftJoin(
                'complaint_responses',
                'complaints.id',
                '=',
                'complaint_responses.complaint_id'
            )
            ->where(
                'complaints.against_user_id',
                $providerId
            )
            ->where(function ($query) use (
                $providerId
            ): void {
                $query
                    ->whereNull(
                        'complaints.booking_id'
                    )
                    ->orWhere(
                        'bookings.provider_id',
                        $providerId
                    );
            });
    }

    private function complaintSelect(): array
    {
        return [
            'complaints.id',
            'complaints.public_id',
            'complaints.complainant_id',
            'complainants.public_id as complainant_public_id',
            'complainants.name as complainant_name',
            'complaints.against_user_id',
            'complaints.booking_id',
            'bookings.public_id as booking_public_id',
            'bookings.title as booking_title',
            'bookings.status as booking_status',
            'complaints.record_reference',
            'complaints.subject',
            'complaints.description',
            'complaints.status',
            'complaints.resolution_note',
            'complaints.resolved_at',
            'complaints.created_at',
            'complaints.updated_at',
            'complaint_responses.id as response_id',
            'complaint_responses.public_id as response_public_id',
            'complaint_responses.provider_id as response_provider_id',
            'complaint_responses.response_text',
            'complaint_responses.status as response_status',
            'complaint_responses.submitted_at',
            'complaint_responses.last_edited_at',
        ];
    }

    private function findComplaint(
        int $providerId,
        string $complaintPublicId
    ): ?object {
        return $this->baseComplaintQuery(
            $providerId
        )
            ->where(
                'complaints.public_id',
                $complaintPublicId
            )
            ->select(
                $this->complaintSelect()
            )
            ->first();
    }

    private function normalizeStatus(
        ?string $status
    ): string {
        return strtolower(
            trim(
                str_replace(
                    '_',
                    ' ',
                    $status ?? ''
                )
            )
        );
    }

    private function canRespond(
        ?string $status
    ): bool {
        return in_array(
            $this->normalizeStatus($status),
            [
                'open',
                'under review',
            ],
            true
        );
    }

    private function decorateComplaint(
        object $complaint
    ): object {
        $complaint->normalized_status =
            $this->normalizeStatus(
                $complaint->status
            );

        $complaint->can_respond =
            $this->canRespond(
                $complaint->status
            );

        $complaint->has_response =
            $complaint->response_id !== null;

        $complaint->booking_available =
            $complaint->booking_id !== null
            && $complaint->booking_public_id !== null;

        /*
         * Complaint handling only requires the
         * complainant's public display name.
         * Email, phone, address and account status
         * are deliberately excluded.
         */
        return $complaint;
    }

    public function index(
        string $providerPublicId
    ): JsonResponse {
        $provider = $this->findProvider(
            $providerPublicId
        );

        if (!$provider) {
            return $this->jsonResponse(
                false,
                'Provider account not found.',
                null,
                null,
                404
            );
        }

        $complaints =
            $this->baseComplaintQuery(
                $provider->id
            )
                ->select(
                    $this->complaintSelect()
                )
                ->orderByRaw(
                    "CASE
                        WHEN complaints.status IN (
                            'open',
                            'under review',
                            'under_review'
                        ) THEN 1
                        WHEN complaints.status = 'resolved'
                            THEN 2
                        WHEN complaints.status = 'closed'
                            THEN 3
                        ELSE 4
                    END"
                )
                ->orderByDesc(
                    'complaints.created_at'
                )
                ->get()
                ->map(function (
                    object $complaint
                ): object {
                    return $this
                        ->decorateComplaint(
                            $complaint
                        );
                });

        $openCount = $complaints
            ->filter(function (
                object $complaint
            ): bool {
                return in_array(
                    $complaint
                        ->normalized_status,
                    [
                        'open',
                        'under review',
                    ],
                    true
                );
            })
            ->count();

        $respondedCount = $complaints
            ->where(
                'has_response',
                true
            )
            ->count();

        $resolvedCount = $complaints
            ->filter(function (
                object $complaint
            ): bool {
                return in_array(
                    $complaint
                        ->normalized_status,
                    [
                        'resolved',
                        'closed',
                    ],
                    true
                );
            })
            ->count();

        return $this->jsonResponse(
            true,
            'Provider complaints retrieved successfully.',
            [
                'provider_public_id' =>
                    $provider->public_id,

                'summary' => [
                    'total' =>
                        $complaints->count(),

                    'open_count' =>
                        $openCount,

                    'responded_count' =>
                        $respondedCount,

                    'resolved_count' =>
                        $resolvedCount,
                ],

                'items' => $complaints,
                'total' => $complaints->count(),
            ]
        );
    }

    public function show(
        string $providerPublicId,
        string $complaintPublicId
    ): JsonResponse {
        $provider = $this->findProvider(
            $providerPublicId
        );

        if (!$provider) {
            return $this->jsonResponse(
                false,
                'Provider account not found.',
                null,
                null,
                404
            );
        }

        $complaint = $this->findComplaint(
            $provider->id,
            $complaintPublicId
        );

        if (!$complaint) {
            return $this->jsonResponse(
                false,
                'Complaint not found.',
                null,
                null,
                404
            );
        }

        return $this->jsonResponse(
            true,
            'Provider complaint retrieved successfully.',
            $this->decorateComplaint(
                $complaint
            )
        );
    }

    public function respond(
        StoreProviderComplaintResponseRequest $request,
        string $providerPublicId,
        string $complaintPublicId
    ): JsonResponse {
        $provider = $this->findProvider(
            $providerPublicId
        );

        if (!$provider) {
            return $this->jsonResponse(
                false,
                'Provider account not found.',
                null,
                null,
                404
            );
        }

        $validated = $request->validated();

        try {
            $result = DB::transaction(
                function () use (
                    $provider,
                    $complaintPublicId,
                    $validated
                ): array {
                    $complaint =
                        DB::table('complaints')
                            ->where(
                                'public_id',
                                $complaintPublicId
                            )
                            ->where(
                                'against_user_id',
                                $provider->id
                            )
                            ->lockForUpdate()
                            ->first();

                    if (!$complaint) {
                        throw new RuntimeException(
                            'COMPLAINT_NOT_FOUND'
                        );
                    }

                    if (
                        $complaint->booking_id
                        !== null
                    ) {
                        $bookingOwned =
                            DB::table('bookings')
                                ->where(
                                    'id',
                                    $complaint
                                        ->booking_id
                                )
                                ->where(
                                    'provider_id',
                                    $provider->id
                                )
                                ->exists();

                        if (!$bookingOwned) {
                            throw new RuntimeException(
                                'COMPLAINT_NOT_FOUND'
                            );
                        }
                    }

                    if (
                        !$this->canRespond(
                            $complaint->status
                        )
                    ) {
                        throw new RuntimeException(
                            'COMPLAINT_READ_ONLY:'
                            . $complaint->status
                        );
                    }

                    $existingResponse =
                        DB::table(
                            'complaint_responses'
                        )
                            ->where(
                                'complaint_id',
                                $complaint->id
                            )
                            ->lockForUpdate()
                            ->first();

                    if ($existingResponse) {
                        if (
                            $existingResponse
                                ->provider_id
                            !== $provider->id
                        ) {
                            throw new RuntimeException(
                                'COMPLAINT_NOT_FOUND'
                            );
                        }

                        DB::table(
                            'complaint_responses'
                        )
                            ->where(
                                'id',
                                $existingResponse->id
                            )
                            ->update([
                                'response_text' =>
                                    $validated[
                                        'response_text'
                                    ],

                                'status' =>
                                    'submitted',

                                'last_edited_at' =>
                                    now(),

                                'updated_at' =>
                                    now(),
                            ]);

                        return [
                            'created' => false,
                        ];
                    }

                    DB::table(
                        'complaint_responses'
                    )->insert([
                        'public_id' =>
                            $this
                                ->createResponsePublicId(),

                        'complaint_id' =>
                            $complaint->id,

                        'provider_id' =>
                            $provider->id,

                        'response_text' =>
                            $validated[
                                'response_text'
                            ],

                        'status' =>
                            'submitted',

                        'submitted_at' =>
                            now(),

                        'last_edited_at' =>
                            null,

                        'created_at' =>
                            now(),

                        'updated_at' =>
                            now(),
                    ]);

                    return [
                        'created' => true,
                    ];
                }
            );
        } catch (RuntimeException $exception) {
            if (
                $exception->getMessage()
                === 'COMPLAINT_NOT_FOUND'
            ) {
                return $this->jsonResponse(
                    false,
                    'Complaint not found.',
                    null,
                    null,
                    404
                );
            }

            if (
                str_starts_with(
                    $exception->getMessage(),
                    'COMPLAINT_READ_ONLY:'
                )
            ) {
                $currentStatus = substr(
                    $exception->getMessage(),
                    strlen(
                        'COMPLAINT_READ_ONLY:'
                    )
                );

                return $this->jsonResponse(
                    false,
                    'Resolved or closed complaints are read-only.',
                    [
                        'complaint_public_id' =>
                            $complaintPublicId,

                        'current_status' =>
                            $currentStatus,
                    ],
                    null,
                    409
                );
            }

            report($exception);

            return $this->jsonResponse(
                false,
                'The complaint response could not be saved.',
                null,
                null,
                500
            );
        } catch (Throwable $exception) {
            report($exception);

            return $this->jsonResponse(
                false,
                'The complaint response could not be saved.',
                null,
                null,
                500
            );
        }

        $complaint = $this->findComplaint(
            $provider->id,
            $complaintPublicId
        );

        return $this->jsonResponse(
            true,
            $result['created']
                ? 'Complaint response submitted successfully.'
                : 'Complaint response updated successfully.',
            $this->decorateComplaint(
                $complaint
            ),
            null,
            $result['created'] ? 201 : 200
        );
    }
}