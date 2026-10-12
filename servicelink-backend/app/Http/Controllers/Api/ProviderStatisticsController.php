<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProviderStatisticsController extends Controller
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

        $providerId = $provider->id;

        /*
         * Booking summary
         */
        $bookingRows = DB::table('bookings')
            ->where('provider_id', $providerId)
            ->select([
                'id',
                'service_id',
                'status',
                'created_at',
            ])
            ->get();

        $totalBookings = $bookingRows->count();

        $bookingStatuses = [
            'pending' => 0,
            'accepted' => 0,
            'in progress' => 0,
            'completed' => 0,
            'rejected' => 0,
        ];

        foreach ($bookingRows as $booking) {
            $status = strtolower(
                trim(
                    str_replace(
                        '_',
                        ' ',
                        $booking->status
                    )
                )
            );

            if (!array_key_exists(
                $status,
                $bookingStatuses
            )) {
                $bookingStatuses[$status] = 0;
            }

            $bookingStatuses[$status]++;
        }

        $completedBookings =
            $bookingStatuses['completed'] ?? 0;

        $completionRate = $totalBookings > 0
            ? round(
                (
                    $completedBookings
                    / $totalBookings
                ) * 100,
                1
            )
            : 0;

        /*
         * Offer summary
         */
        $offerRows = DB::table('offers')
            ->where('provider_id', $providerId)
            ->select([
                'id',
                'status',
            ])
            ->get();

        $totalOffers = $offerRows->count();

        $acceptedOffers = $offerRows
            ->where('status', 'accepted')
            ->count();

        $submittedOffers = $offerRows
            ->where('status', 'submitted')
            ->count();

        $declinedOffers = $offerRows
            ->where('status', 'declined')
            ->count();

        $withdrawnOffers = $offerRows
            ->where('status', 'withdrawn')
            ->count();

        $decidedOffers =
            $acceptedOffers + $declinedOffers;

        $offerAcceptanceRate =
            $decidedOffers > 0
                ? round(
                    (
                        $acceptedOffers
                        / $decidedOffers
                    ) * 100,
                    1
                )
                : 0;

        /*
         * Earnings summary
         */
        $earnings = DB::table('transactions')
            ->where('provider_id', $providerId)
            ->selectRaw(
                '
                COUNT(*) as transaction_count,
                COALESCE(
                    SUM(gross_amount),
                    0
                ) as gross_value,
                COALESCE(
                    SUM(commission_amount),
                    0
                ) as commission_value,
                COALESCE(
                    SUM(provider_net_amount),
                    0
                ) as net_value
                '
            )
            ->first();

        /*
         * Valid published review summary
         */
        $validReviewQuery = DB::table('reviews')
            ->join(
                'bookings',
                'reviews.booking_id',
                '=',
                'bookings.id'
            )
            ->where(
                'reviews.provider_id',
                $providerId
            )
            ->where(
                'bookings.provider_id',
                $providerId
            )
            ->whereColumn(
                'reviews.customer_id',
                'bookings.customer_id'
            )
            ->where(
                'reviews.status',
                'published'
            )
            ->where(
                'bookings.status',
                'completed'
            )
            ->whereBetween(
                'reviews.rating',
                [1, 5]
            );

        $reviewCount = (
            clone $validReviewQuery
        )->count('reviews.id');

        $averageRating = $reviewCount > 0
            ? round(
                (float) (
                    clone $validReviewQuery
                )->avg('reviews.rating'),
                2
            )
            : 0;

        /*
         * Service summary
         */
        $serviceRows = DB::table('services')
            ->where('provider_id', $providerId)
            ->select([
                'id',
                'public_id',
                'title',
                'status',
                'price_display',
            ])
            ->orderBy('title')
            ->get();

        $activeServices = $serviceRows
            ->where('status', 'active')
            ->count();

        $servicePerformance = $serviceRows
            ->map(function (
                object $service
            ) use ($providerId): array {
                $bookingQuery = DB::table(
                    'bookings'
                )
                    ->where(
                        'provider_id',
                        $providerId
                    )
                    ->where(
                        'service_id',
                        $service->id
                    );

                return [
                    'service_public_id' =>
                        $service->public_id,

                    'service_title' =>
                        $service->title,

                    'service_status' =>
                        $service->status,

                    'price_display' =>
                        $service->price_display,

                    'booking_count' =>
                        (clone $bookingQuery)
                            ->count(),

                    'completed_count' =>
                        (clone $bookingQuery)
                            ->where(
                                'status',
                                'completed'
                            )
                            ->count(),

                    'gross_value' =>
                        number_format(
                            (float) (
                                clone $bookingQuery
                            )->sum(
                                'agreed_amount'
                            ),
                            2,
                            '.',
                            ''
                        ),

                    'provider_net_value' =>
                        number_format(
                            (float) (
                                clone $bookingQuery
                            )->sum(
                                'provider_net_amount'
                            ),
                            2,
                            '.',
                            ''
                        ),
                ];
            })
            ->values();

        /*
         * Legacy and custom bookings
         */
        $legacyBookingQuery = DB::table(
            'bookings'
        )
            ->where(
                'provider_id',
                $providerId
            )
            ->whereNull('service_id');

        $legacyBookingCount = (
            clone $legacyBookingQuery
        )->count();

        if ($legacyBookingCount > 0) {
            $servicePerformance->push([
                'service_public_id' => null,

                'service_title' =>
                    'Legacy or custom booking',

                'service_status' =>
                    'legacy',

                'price_display' => null,

                'booking_count' =>
                    $legacyBookingCount,

                'completed_count' =>
                    (clone $legacyBookingQuery)
                        ->where(
                            'status',
                            'completed'
                        )
                        ->count(),

                'gross_value' =>
                    number_format(
                        (float) (
                            clone $legacyBookingQuery
                        )->sum(
                            'agreed_amount'
                        ),
                        2,
                        '.',
                        ''
                    ),

                'provider_net_value' =>
                    number_format(
                        (float) (
                            clone $legacyBookingQuery
                        )->sum(
                            'provider_net_amount'
                        ),
                        2,
                        '.',
                        ''
                    ),
            ]);
        }

        /*
         * Last six calendar months
         */
        $monthlyActivity = [];

        for ($offset = 5; $offset >= 0; $offset--) {
            $month = Carbon::now()
                ->startOfMonth()
                ->subMonths($offset);

            $monthStart = $month
                ->copy()
                ->startOfMonth();

            $monthEnd = $month
                ->copy()
                ->endOfMonth();

            $monthlyBookings = DB::table(
                'bookings'
            )
                ->where(
                    'provider_id',
                    $providerId
                )
                ->whereBetween(
                    'created_at',
                    [
                        $monthStart,
                        $monthEnd,
                    ]
                );

            $monthlyTransactions = DB::table(
                'transactions'
            )
                ->where(
                    'provider_id',
                    $providerId
                )
                ->whereBetween(
                    DB::raw(
                        'COALESCE(
                            recorded_at,
                            created_at
                        )'
                    ),
                    [
                        $monthStart,
                        $monthEnd,
                    ]
                );

            $monthlyActivity[] = [
                'key' =>
                    $month->format('Y-m'),

                'label' =>
                    $month->format('M'),

                'year' =>
                    (int) $month->format('Y'),

                'booking_count' =>
                    (clone $monthlyBookings)
                        ->count(),

                'completed_count' =>
                    (clone $monthlyBookings)
                        ->where(
                            'status',
                            'completed'
                        )
                        ->count(),

                'gross_value' =>
                    number_format(
                        (float) (
                            clone $monthlyTransactions
                        )->sum(
                            'gross_amount'
                        ),
                        2,
                        '.',
                        ''
                    ),

                'commission_value' =>
                    number_format(
                        (float) (
                            clone $monthlyTransactions
                        )->sum(
                            'commission_amount'
                        ),
                        2,
                        '.',
                        ''
                    ),

                'net_value' =>
                    number_format(
                        (float) (
                            clone $monthlyTransactions
                        )->sum(
                            'provider_net_amount'
                        ),
                        2,
                        '.',
                        ''
                    ),
            ];
        }

        return $this->jsonResponse(
            true,
            'Provider statistics retrieved successfully.',
            [
                'provider_public_id' =>
                    $provider->public_id,

                'summary' => [
                    'total_bookings' =>
                        $totalBookings,

                    'completed_bookings' =>
                        $completedBookings,

                    'completion_rate' =>
                        $completionRate,

                    'total_offers' =>
                        $totalOffers,

                    'accepted_offers' =>
                        $acceptedOffers,

                    'offer_acceptance_rate' =>
                        $offerAcceptanceRate,

                    'active_services' =>
                        $activeServices,

                    'review_count' =>
                        $reviewCount,

                    'average_rating' =>
                        number_format(
                            $averageRating,
                            2,
                            '.',
                            ''
                        ),

                    'transaction_count' =>
                        (int) (
                            $earnings
                                ->transaction_count
                            ?? 0
                        ),

                    'gross_value' =>
                        number_format(
                            (float) (
                                $earnings->gross_value
                                ?? 0
                            ),
                            2,
                            '.',
                            ''
                        ),

                    'commission_value' =>
                        number_format(
                            (float) (
                                $earnings
                                    ->commission_value
                                ?? 0
                            ),
                            2,
                            '.',
                            ''
                        ),

                    'net_value' =>
                        number_format(
                            (float) (
                                $earnings->net_value
                                ?? 0
                            ),
                            2,
                            '.',
                            ''
                        ),
                ],

                'booking_statuses' => [
                    'pending' =>
                        $bookingStatuses[
                            'pending'
                        ] ?? 0,

                    'accepted' =>
                        $bookingStatuses[
                            'accepted'
                        ] ?? 0,

                    'in_progress' =>
                        $bookingStatuses[
                            'in progress'
                        ] ?? 0,

                    'completed' =>
                        $bookingStatuses[
                            'completed'
                        ] ?? 0,

                    'rejected' =>
                        $bookingStatuses[
                            'rejected'
                        ] ?? 0,
                ],

                'offer_statuses' => [
                    'submitted' =>
                        $submittedOffers,

                    'accepted' =>
                        $acceptedOffers,

                    'declined' =>
                        $declinedOffers,

                    'withdrawn' =>
                        $withdrawnOffers,
                ],

                'monthly_activity' =>
                    $monthlyActivity,

                'service_performance' =>
                    $servicePerformance,
            ]
        );
    }
}