<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class ProviderEarningController extends Controller
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

    private function createTransactionPublicId(): string
    {
        do {
            $publicId =
                'TR-' . strtoupper(Str::random(10));
        } while (
            DB::table('transactions')
                ->where('public_id', $publicId)
                ->exists()
        );

        return $publicId;
    }

    private function synchronizeTransactions(
        int $providerId
    ): void {
        $bookings = DB::table('bookings')
            ->where('provider_id', $providerId)
            ->whereIn('status', [
                'pending',
                'accepted',
                'in progress',
                'completed',
            ])
            ->get();

        foreach ($bookings as $booking) {
            $existing = DB::table('transactions')
                ->where('booking_id', $booking->id)
                ->first();

            $transactionStatus =
                $booking->status === 'completed'
                    ? 'recorded'
                    : 'pending';

            $recordedAt =
                $transactionStatus === 'recorded'
                    ? (
                        $booking->completed_at
                        ?? $booking->updated_at
                        ?? now()
                    )
                    : null;

            $data = [
                'customer_id' =>
                    $booking->customer_id,
                'provider_id' =>
                    $booking->provider_id,
                'source' =>
                    $booking->source,
                'gross_amount' =>
                    $booking->agreed_amount,
                'commission_rate' =>
                    $booking->commission_rate,
                'commission_amount' =>
                    $booking->commission_amount,
                'provider_net_amount' =>
                    $booking->provider_net_amount,
                'status' =>
                    $transactionStatus,
                'recorded_at' =>
                    $recordedAt,
                'updated_at' => now(),
            ];

            if ($existing) {
                DB::table('transactions')
                    ->where('id', $existing->id)
                    ->update($data);

                continue;
            }

            DB::table('transactions')->insert([
                'public_id' =>
                    $this->createTransactionPublicId(),
                'booking_id' =>
                    $booking->id,
                ...$data,
                'created_at' => now(),
            ]);
        }
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

        try {
            DB::transaction(function () use (
                $provider
            ): void {
                $this->synchronizeTransactions(
                    $provider->id
                );
            });
        } catch (Throwable $exception) {
            report($exception);

            return $this->jsonResponse(
                false,
                'Provider earnings could not be synchronized.',
                null,
                null,
                500
            );
        }

        $transactions = DB::table('transactions')
            ->join(
                'bookings',
                'transactions.booking_id',
                '=',
                'bookings.id'
            )
            ->where(
                'transactions.provider_id',
                $provider->id
            )
            ->select([
                'transactions.id',
                'transactions.public_id',
                'transactions.booking_id',
                'bookings.public_id as booking_public_id',
                'bookings.title as booking_title',
                'bookings.date_display',
                'bookings.scheduled_date',
                'bookings.scheduled_time',
                'bookings.status as booking_status',
                'transactions.source',
                'transactions.gross_amount',
                'transactions.commission_rate',
                'transactions.commission_amount',
                'transactions.provider_net_amount',
                'transactions.status',
                'transactions.recorded_at',
                'transactions.created_at',
                'transactions.updated_at',
            ])
            ->orderByDesc(
                DB::raw(
                    'COALESCE(
                        transactions.recorded_at,
                        transactions.created_at
                    )'
                )
            )
            ->get();

        $summaryQuery = DB::table('transactions')
            ->where(
                'provider_id',
                $provider->id
            );

        $grossValue = (clone $summaryQuery)
            ->sum('gross_amount');

        $commissionValue = (clone $summaryQuery)
            ->sum('commission_amount');

        $netValue = (clone $summaryQuery)
            ->sum('provider_net_amount');

        $recordedGross = (clone $summaryQuery)
            ->where('status', 'recorded')
            ->sum('gross_amount');

        $recordedCommission = (clone $summaryQuery)
            ->where('status', 'recorded')
            ->sum('commission_amount');

        $recordedNet = (clone $summaryQuery)
            ->where('status', 'recorded')
            ->sum('provider_net_amount');

        $pendingGross = (clone $summaryQuery)
            ->where('status', 'pending')
            ->sum('gross_amount');

        $pendingCommission = (clone $summaryQuery)
            ->where('status', 'pending')
            ->sum('commission_amount');

        $pendingNet = (clone $summaryQuery)
            ->where('status', 'pending')
            ->sum('provider_net_amount');

        return $this->jsonResponse(
            true,
            'Provider earnings retrieved successfully.',
            [
                'provider_public_id' =>
                    $provider->public_id,

                'summary' => [
                    'gross_value' =>
                        number_format(
                            (float) $grossValue,
                            2,
                            '.',
                            ''
                        ),

                    'commission_value' =>
                        number_format(
                            (float) $commissionValue,
                            2,
                            '.',
                            ''
                        ),

                    'net_value' =>
                        number_format(
                            (float) $netValue,
                            2,
                            '.',
                            ''
                        ),

                    'recorded_gross' =>
                        number_format(
                            (float) $recordedGross,
                            2,
                            '.',
                            ''
                        ),

                    'recorded_commission' =>
                        number_format(
                            (float) $recordedCommission,
                            2,
                            '.',
                            ''
                        ),

                    'recorded_net' =>
                        number_format(
                            (float) $recordedNet,
                            2,
                            '.',
                            ''
                        ),

                    'pending_gross' =>
                        number_format(
                            (float) $pendingGross,
                            2,
                            '.',
                            ''
                        ),

                    'pending_commission' =>
                        number_format(
                            (float) $pendingCommission,
                            2,
                            '.',
                            ''
                        ),

                    'pending_net' =>
                        number_format(
                            (float) $pendingNet,
                            2,
                            '.',
                            ''
                        ),

                    'transaction_count' =>
                        $transactions->count(),

                    'recorded_count' =>
                        $transactions
                            ->where(
                                'status',
                                'recorded'
                            )
                            ->count(),

                    'pending_count' =>
                        $transactions
                            ->where(
                                'status',
                                'pending'
                            )
                            ->count(),
                ],

                'items' => $transactions,
                'total' => $transactions->count(),
            ]
        );
    }
}