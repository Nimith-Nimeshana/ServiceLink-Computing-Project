<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

class ProviderReviewController extends Controller
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

    private function validReviewQuery(
        int $providerId
    ) {
        return DB::table('reviews')
            ->join(
                'bookings',
                'reviews.booking_id',
                '=',
                'bookings.id'
            )
            ->join(
                'users as customers',
                'reviews.customer_id',
                '=',
                'customers.id'
            )
            ->leftJoin(
                'services',
                'bookings.service_id',
                '=',
                'services.id'
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
                'bookings.status',
                'completed'
            )
            ->where(
                'reviews.status',
                'published'
            )
            ->whereBetween(
                'reviews.rating',
                [1, 5]
            );
    }

    private function synchronizeProfileRating(
        int $providerId,
        float $averageRating,
        int $reviewCount
    ): void {
        DB::table('provider_profiles')
            ->where('user_id', $providerId)
            ->update([
                'average_rating' =>
                    number_format(
                        $averageRating,
                        2,
                        '.',
                        ''
                    ),

                'review_count' =>
                    $reviewCount,

                'updated_at' => now(),
            ]);
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

        $summaryQuery =
            $this->validReviewQuery(
                $provider->id
            );

        $reviewCount = (clone $summaryQuery)
            ->count('reviews.id');

        $averageRating = $reviewCount > 0
            ? (float) (
                clone $summaryQuery
            )->avg('reviews.rating')
            : 0.0;

        $distributionRows =
            (clone $summaryQuery)
                ->select([
                    'reviews.rating',
                    DB::raw(
                        'COUNT(reviews.id) as total'
                    ),
                ])
                ->groupBy('reviews.rating')
                ->get()
                ->keyBy('rating');

        $distribution = [];

        for ($rating = 5; $rating >= 1; $rating--) {
            $count = isset(
                $distributionRows[$rating]
            )
                ? (int) $distributionRows[
                    $rating
                ]->total
                : 0;

            $distribution[] = [
                'rating' => $rating,
                'count' => $count,
                'percentage' =>
                    $reviewCount > 0
                        ? round(
                            (
                                $count
                                / $reviewCount
                            ) * 100,
                            1
                        )
                        : 0,
            ];
        }

        $reviews = $this->validReviewQuery(
            $provider->id
        )
            ->select([
                'reviews.id',
                'reviews.public_id',
                'reviews.booking_id',
                'bookings.public_id as booking_public_id',
                'bookings.title as booking_title',
                'bookings.service_id',
                'services.public_id as service_public_id',
                DB::raw(
                    'COALESCE(
                        services.title,
                        bookings.title
                    ) as service_title'
                ),
                'reviews.customer_id',
                'customers.public_id as customer_public_id',
                'customers.name as customer_name',
                'reviews.provider_id',
                'reviews.rating',
                'reviews.comment',
                'reviews.status',
                'reviews.reports_count',
                'reviews.created_at',
                'reviews.updated_at',
            ])
            ->orderByDesc(
                'reviews.created_at'
            )
            ->get();

        try {
            $this->synchronizeProfileRating(
                $provider->id,
                $averageRating,
                $reviewCount
            );
        } catch (Throwable $exception) {
            report($exception);

            return $this->jsonResponse(
                false,
                'Provider rating summary could not be synchronized.',
                null,
                null,
                500
            );
        }

        return $this->jsonResponse(
            true,
            'Provider reviews retrieved successfully.',
            [
                'provider_public_id' =>
                    $provider->public_id,

                'summary' => [
                    'average_rating' =>
                        number_format(
                            $averageRating,
                            2,
                            '.',
                            ''
                        ),

                    'review_count' =>
                        $reviewCount,

                    'five_star_count' =>
                        collect($distribution)
                            ->firstWhere(
                                'rating',
                                5
                            )['count'],

                    'distribution' =>
                        $distribution,
                ],

                'items' => $reviews,
                'total' => $reviews->count(),
            ]
        );
    }
}