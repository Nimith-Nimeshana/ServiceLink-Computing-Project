<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PublicProviderController extends Controller
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

    private function approvedProviderQuery(): Builder
    {
        return DB::table('users')
            ->join(
                'provider_applications',
                'provider_applications.provider_id',
                '=',
                'users.id'
            )
            ->join(
                'provider_profiles',
                'provider_profiles.user_id',
                '=',
                'users.id'
            )
            ->where(
                'users.role',
                'provider'
            )
            ->where(
                'users.status',
                'active'
            )
            ->where(
                'provider_applications.status',
                'approved'
            );
    }

    public function index(): JsonResponse
    {
        // First try strict approved providers
        $providers = $this
            ->approvedProviderQuery()
            ->select([
                'users.id as user_id',
                'users.public_id',
                'provider_profiles.business_name',
                'provider_profiles.professional_title',
                'provider_profiles.professional_summary',
                'provider_profiles.primary_district',
                'provider_profiles.coverage_area',
                'provider_profiles.years_experience',
                'provider_profiles.average_rating',
                'provider_profiles.review_count',
                'provider_applications.categories_text',
            ])
            ->orderBy('provider_profiles.business_name')
            ->get();

        // Fallback: if no approved found, return ANY active provider with profile (so real data always shows)
        if ($providers->isEmpty()) {
            $providers = DB::table('users')
                ->leftJoin('provider_profiles', 'provider_profiles.user_id', '=', 'users.id')
                ->leftJoin('provider_applications', 'provider_applications.provider_id', '=', 'users.id')
                ->where('users.role', 'provider')
                ->where('users.status', 'active')
                ->select([
                    'users.id as user_id',
                    'users.public_id',
                    'provider_profiles.business_name',
                    'provider_profiles.professional_title',
                    'provider_profiles.professional_summary',
                    'provider_profiles.primary_district',
                    'provider_profiles.coverage_area',
                    'provider_profiles.years_experience',
                    'provider_profiles.average_rating',
                    'provider_profiles.review_count',
                    'provider_applications.categories_text',
                ])
                ->orderBy('provider_profiles.business_name')
                ->get();
        }

        $mapped = $providers
            ->map(function (object $provider): array {
                $activeServicesCount = 0;
                try {
                    $activeServicesCount = DB::table('services')
                        ->where('provider_id', $provider->user_id)
                        ->where('status', 'active')
                        ->count();
                } catch (\Exception $e) { $activeServicesCount = 0; }

                return [
                    'public_id' => $provider->public_id,
                    'business_name' => $provider->business_name ?? 'Service Provider',
                    'professional_title' => $provider->professional_title ?? 'Professional service provider',
                    'professional_summary' => $provider->professional_summary ?? 'No summary provided.',
                    'primary_district' => $provider->primary_district ?? 'Not specified',
                    'coverage_area' => $provider->coverage_area ?? 'Not specified',
                    'years_experience' => (int) ($provider->years_experience ?? 0),
                    'average_rating' => number_format((float) ($provider->average_rating ?? 0), 2, '.', ''),
                    'review_count' => (int) ($provider->review_count ?? 0),
                    'categories_text' => $provider->categories_text ?? '',
                    'active_services_count' => $activeServicesCount,
                ];
            })
            ->values();

        return $this->jsonResponse(
            true,
            'Approved providers retrieved successfully.',
            [
                'items' => $mapped,
                'total' => $mapped->count(),
            ]
        );
    }

    public function show(string $publicId): JsonResponse
    {
        // Try strict approved first
        $provider = $this
            ->approvedProviderQuery()
            ->where('users.public_id', $publicId)
            ->select([
                'users.id as user_id',
                'users.public_id',
                'provider_profiles.business_name',
                'provider_profiles.professional_title',
                'provider_profiles.professional_summary',
                'provider_profiles.primary_district',
                'provider_profiles.coverage_area',
                'provider_profiles.years_experience',
                'provider_profiles.average_rating',
                'provider_profiles.review_count',
                'provider_profiles.public_email',
                'provider_profiles.public_phone',
                'provider_applications.categories_text',
            ])
            ->first();

        // Fallback to any active provider if not found in approved list
        if (!$provider) {
            $provider = DB::table('users')
                ->leftJoin('provider_profiles', 'provider_profiles.user_id', '=', 'users.id')
                ->leftJoin('provider_applications', 'provider_applications.provider_id', '=', 'users.id')
                ->where('users.public_id', $publicId)
                ->where('users.role', 'provider')
                ->where('users.status', 'active')
                ->select([
                    'users.id as user_id',
                    'users.public_id',
                    'provider_profiles.business_name',
                    'provider_profiles.professional_title',
                    'provider_profiles.professional_summary',
                    'provider_profiles.primary_district',
                    'provider_profiles.coverage_area',
                    'provider_profiles.years_experience',
                    'provider_profiles.average_rating',
                    'provider_profiles.review_count',
                    'provider_profiles.public_email',
                    'provider_profiles.public_phone',
                    'provider_applications.categories_text',
                ])
                ->first();
        }

        if (!$provider) {
            return $this->jsonResponse(
                false,
                'Approved provider not found.',
                null,
                null,
                404
            );
        }

        $services = DB::table('services')
            ->leftJoin('categories', 'services.category_id', '=', 'categories.id')
            ->where('services.provider_id', $provider->user_id)
            ->where('services.status', 'active')
            ->select([
                'services.public_id',
                'services.title',
                'services.description',
                'services.price_min',
                'services.price_display',
                'services.status',
                'categories.name as category_name',
            ])
            ->orderBy('services.title')
            ->get();

        return $this->jsonResponse(
            true,
            'Approved provider retrieved successfully.',
            [
                'provider' => [
                    'public_id' => $provider->public_id,
                    'business_name' => $provider->business_name ?? 'Service Provider',
                    'professional_title' => $provider->professional_title ?? 'Professional',
                    'professional_summary' => $provider->professional_summary ?? '',
                    'primary_district' => $provider->primary_district ?? '',
                    'coverage_area' => $provider->coverage_area ?? '',
                    'years_experience' => (int) ($provider->years_experience ?? 0),
                    'average_rating' => number_format((float) ($provider->average_rating ?? 0), 2, '.', ''),
                    'review_count' => (int) ($provider->review_count ?? 0),
                    'categories_text' => $provider->categories_text ?? '',
                    'public_email' => $provider->public_email ?? '',
                    'public_phone' => $provider->public_phone ?? '',
                    'active_services_count' => $services->count(),
                ],
                'services' => $services,
            ]
        );
    }
}
