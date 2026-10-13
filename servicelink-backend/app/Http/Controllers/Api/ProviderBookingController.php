<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProviderBookingStatusRequest;
use Illuminate\Http\JsonResponse;
use App\Helpers\NotificationHelper;
use Illuminate\Support\Facades\DB;
use Throwable;

class ProviderBookingController extends Controller
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
            ->where('public_id', $providerPublicId)
            ->where('role', 'provider')
            ->first();
    }

    private function baseBookingQuery()
    {
        return DB::table('bookings')
            ->join(
                'users as customers',
                'bookings.customer_id',
                '=',
                'customers.id'
            )
            ->leftJoin(
                'services',
                'bookings.service_id',
                '=',
                'services.id'
            )
            ->leftJoin(
                'offers',
                'bookings.offer_id',
                '=',
                'offers.id'
            );
    }

    private function bookingRecord(
        int $providerId,
        string $bookingPublicId
    ): ?object {
        return $this->baseBookingQuery()
            ->where(
                'bookings.provider_id',
                $providerId
            )
            ->where(
                'bookings.public_id',
                $bookingPublicId
            )
            ->select([
                'bookings.id',
                'bookings.public_id',
                'bookings.customer_id',
                'customers.public_id as customer_public_id',
                'customers.name as customer_name',
                'customers.phone as customer_phone',
                'customers.email as customer_email',
                'bookings.provider_id',
                'bookings.service_id',
                'services.public_id as service_public_id',
                'services.title as service_title',
                'bookings.offer_id',
                'offers.public_id as offer_public_id',
                'bookings.title',
                'bookings.source',
                'bookings.scheduled_date',
                'bookings.scheduled_time',
                'bookings.duration_minutes',
                'bookings.task_description',
                'bookings.district',
                'bookings.address',
                'bookings.customer_note',
                'bookings.provider_note',
                'bookings.date_display',
                'bookings.agreed_amount',
                'bookings.commission_rate',
                'bookings.commission_amount',
                'bookings.provider_net_amount',
                'bookings.status',
                'bookings.accepted_at',
                'bookings.rejected_at',
                'bookings.started_at',
                'bookings.completed_at',
                'bookings.created_at',
                'bookings.updated_at',
            ])
            ->first();
    }

    private function hideSensitiveInformation(
        object $booking
    ): object {
        $contactVisible = in_array(
            $booking->status,
            [
                'accepted',
                'in progress',
                'completed',
            ],
            true
        );

        if (!$contactVisible) {
            $booking->customer_phone = null;
            $booking->customer_email = null;
            $booking->address = null;
        }

        $booking->contact_details_visible =
            $contactVisible;

        return $booking;
    }

    private function historyForBooking(
        int $bookingId
    ) {
        return DB::table(
            'booking_status_histories'
        )
            ->leftJoin(
                'users',
                'booking_status_histories.changed_by',
                '=',
                'users.id'
            )
            ->where(
                'booking_status_histories.booking_id',
                $bookingId
            )
            ->select([
                'booking_status_histories.id',
                'booking_status_histories.from_status',
                'booking_status_histories.to_status',
                'booking_status_histories.changed_by',
                'booking_status_histories.changed_by_role',
                'booking_status_histories.note',
                'booking_status_histories.changed_at',
                'users.public_id as changed_by_public_id',
                'users.name as changed_by_name',
            ])
            ->orderBy(
                'booking_status_histories.changed_at'
            )
            ->orderBy(
                'booking_status_histories.id'
            )
            ->get();
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

        $bookings = $this->baseBookingQuery()
            ->where(
                'bookings.provider_id',
                $provider->id
            )
            ->select([
                'bookings.id',
                'bookings.public_id',
                'customers.public_id as customer_public_id',
                'customers.name as customer_name',
                'bookings.service_id',
                'services.public_id as service_public_id',
                'services.title as service_title',
                'bookings.offer_id',
                'offers.public_id as offer_public_id',
                'bookings.title',
                'bookings.source',
                'bookings.scheduled_date',
                'bookings.scheduled_time',
                'bookings.duration_minutes',
                'bookings.district',
                'bookings.date_display',
                'bookings.agreed_amount',
                'bookings.commission_rate',
                'bookings.commission_amount',
                'bookings.provider_net_amount',
                'bookings.status',
                'bookings.created_at',
                'bookings.updated_at',
            ])
            ->orderByRaw(
                "CASE
                    WHEN bookings.status = 'pending'
                        THEN 1
                    WHEN bookings.status = 'accepted'
                        THEN 2
                    WHEN bookings.status = 'in progress'
                        THEN 3
                    WHEN bookings.status = 'completed'
                        THEN 4
                    WHEN bookings.status = 'rejected'
                        THEN 5
                    ELSE 6
                END"
            )
            ->orderByDesc('bookings.created_at')
            ->get();

        return $this->jsonResponse(
            true,
            'Provider bookings retrieved successfully.',
            [
                'provider_public_id' =>
                    $provider->public_id,
                'items' => $bookings,
                'total' => $bookings->count(),
            ]
        );
    }

    public function requests(
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

        $bookings = $this->baseBookingQuery()
            ->where(
                'bookings.provider_id',
                $provider->id
            )
            ->where(
                'bookings.status',
                'pending'
            )
            ->select([
                'bookings.id',
                'bookings.public_id',
                'customers.public_id as customer_public_id',
                'customers.name as customer_name',
                'services.public_id as service_public_id',
                'services.title as service_title',
                'offers.public_id as offer_public_id',
                'bookings.title',
                'bookings.source',
                'bookings.scheduled_date',
                'bookings.scheduled_time',
                'bookings.duration_minutes',
                'bookings.task_description',
                'bookings.district',
                'bookings.customer_note',
                'bookings.date_display',
                'bookings.agreed_amount',
                'bookings.status',
                'bookings.created_at',
            ])
            ->orderBy('bookings.scheduled_date')
            ->orderBy('bookings.scheduled_time')
            ->orderBy('bookings.created_at')
            ->get();

        return $this->jsonResponse(
            true,
            'Pending booking requests retrieved successfully.',
            [
                'provider_public_id' =>
                    $provider->public_id,
                'items' => $bookings,
                'total' => $bookings->count(),
            ]
        );
    }

    public function show(
        string $providerPublicId,
        string $bookingPublicId
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

        $booking = $this->bookingRecord(
            $provider->id,
            $bookingPublicId
        );

        if (!$booking) {
            return $this->jsonResponse(
                false,
                'Booking not found.',
                null,
                null,
                404
            );
        }

        $booking = $this->hideSensitiveInformation(
            $booking
        );

        return $this->jsonResponse(
            true,
            'Provider booking retrieved successfully.',
            [
                'booking' => $booking,
                'history' =>
                    $this->historyForBooking(
                        $booking->id
                    ),
            ]
        );
    }

    public function updateStatus(
        UpdateProviderBookingStatusRequest $request,
        string $providerPublicId,
        string $bookingPublicId
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
        $action = $validated['action'];
        $note = $validated['note'] ?? null;

        $transitionRules = [
            'accept' => [
                'from' => 'pending',
                'to' => 'accepted',
                'timestamp' => 'accepted_at',
            ],
            'reject' => [
                'from' => 'pending',
                'to' => 'rejected',
                'timestamp' => 'rejected_at',
            ],
            'start' => [
                'from' => 'accepted',
                'to' => 'in progress',
                'timestamp' => 'started_at',
            ],
            'complete' => [
                'from' => 'in progress',
                'to' => 'completed',
                'timestamp' => 'completed_at',
            ],
        ];

        $rule = $transitionRules[$action];

        try {
            DB::transaction(function () use (
                $provider,
                $bookingPublicId,
                $rule,
                $note
            ): void {
                $booking = DB::table('bookings')
                    ->where(
                        'public_id',
                        $bookingPublicId
                    )
                    ->where(
                        'provider_id',
                        $provider->id
                    )
                    ->lockForUpdate()
                    ->first();

                if (!$booking) {
                    throw new \RuntimeException(
                        'BOOKING_NOT_FOUND'
                    );
                }

                if (
                    $booking->status !==
                    $rule['from']
                ) {
                    throw new \DomainException(
                        'INVALID_TRANSITION:' .
                        $booking->status
                    );
                }

                DB::table('bookings')
                    ->where('id', $booking->id)
                    ->update([
                        'status' => $rule['to'],
                        'provider_note' =>
                            $note ??
                            $booking->provider_note,
                        $rule['timestamp'] => now(),
                        'updated_at' => now(),
                    ]);

                DB::table(
                    'booking_status_histories'
                )->insert([
                    'booking_id' => $booking->id,
                    'from_status' =>
                        $booking->status,
                    'to_status' => $rule['to'],
                    'changed_by' => $provider->id,
                    'changed_by_role' =>
                        'provider',
                    'note' => $note,
                    'changed_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                if (
                    $booking->offer_id !== null
                    && $rule['to'] === 'accepted'
                ) {
                    DB::table('offers')
                        ->where(
                            'id',
                            $booking->offer_id
                        )
                        ->update([
                            'status' => 'accepted',
                            'booking_id' =>
                                $booking->id,
                            'updated_at' => now(),
                        ]);

                    DB::table('offers')
                        ->where(
                            'wanted_ad_id',
                            function ($query) use (
                                $booking
                            ): void {
                                $query->select(
                                    'wanted_ad_id'
                                )
                                    ->from('offers')
                                    ->where(
                                        'id',
                                        $booking->offer_id
                                    )
                                    ->limit(1);
                            }
                        )
                        ->where(
                            'id',
                            '!=',
                            $booking->offer_id
                        )
                        ->where(
                            'status',
                            'submitted'
                        )
                        ->update([
                            'status' => 'declined',
                            'customer_response' =>
                                'Another provider offer was accepted.',
                            'updated_at' => now(),
                        ]);
                }
            });
        } catch (\RuntimeException $exception) {
            if (
                $exception->getMessage() ===
                'BOOKING_NOT_FOUND'
            ) {
                return $this->jsonResponse(
                    false,
                    'Booking not found.',
                    null,
                    null,
                    404
                );
            }

            report($exception);

            return $this->jsonResponse(
                false,
                'The booking status could not be updated.',
                null,
                null,
                500
            );
        } catch (\DomainException $exception) {
            $currentStatus = str_replace(
                'INVALID_TRANSITION:',
                '',
                $exception->getMessage()
            );

            return $this->jsonResponse(
                false,
                "The booking cannot be changed using the '{$action}' action.",
                [
                    'booking_public_id' =>
                        $bookingPublicId,
                    'current_status' =>
                        $currentStatus,
                    'required_status' =>
                        $rule['from'],
                    'requested_status' =>
                        $rule['to'],
                ],
                null,
                409
            );
        } catch (Throwable $exception) {
            report($exception);

            return $this->jsonResponse(
                false,
                'The booking status could not be updated.',
                null,
                null,
                500
            );
        }

        $booking = $this->bookingRecord(
            $provider->id,
            $bookingPublicId
        );

        // NOTIFICATION: Notify customer about booking status change
        try {
            if ($booking && isset($booking->customer_id)) {
                $statusMessages = [
                    'accepted' => 'accepted your booking',
                    'rejected' => 'rejected your booking',
                    'in progress' => 'started work on your booking',
                    'completed' => 'marked your booking as completed',
                ];
                $msg = $statusMessages[$rule['to']] ?? 'updated your booking status to ' . $rule['to'];
                NotificationHelper::create(
                    $booking->customer_id,
                    'booking',
                    'Booking ' . ucfirst($rule['to']),
                    $provider->name . ' ' . $msg . ' (' . $bookingPublicId . ').',
                    'booking',
                    $bookingPublicId,
                    '/customer/bookings/' . $bookingPublicId
                );
            }
        } catch (\Exception $e) {}

        return $this->jsonResponse(
            true,
            "Booking status updated to {$rule['to']}.",
            [
                'booking' =>
                    $this->hideSensitiveInformation(
                        $booking
                    ),
                'history' =>
                    $this->historyForBooking(
                        $booking->id
                    ),
            ]
        );
    }
}