<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProviderWantedAdController extends Controller
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

    private function baseWantedAdQuery()
    {
        return DB::table('wanted_ads')
            ->join(
                'categories',
                'wanted_ads.category_id',
                '=',
                'categories.id'
            )
            ->where('wanted_ads.status', 'active')
            ->where('categories.status', 'active');
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

        $wantedAds = $this->baseWantedAdQuery()
            ->leftJoin('offers', function ($join) use (
                $provider
            ): void {
                $join->on(
                    'offers.wanted_ad_id',
                    '=',
                    'wanted_ads.id'
                )->where(
                    'offers.provider_id',
                    '=',
                    $provider->id
                );
            })
            ->select([
                'wanted_ads.id',
                'wanted_ads.public_id',
                'wanted_ads.category_id',
                'categories.public_id as category_public_id',
                'categories.name as category_name',
                'wanted_ads.title',
                'wanted_ads.description',
                'wanted_ads.district',
                'wanted_ads.budget_display',
                'wanted_ads.deadline_display',
                'wanted_ads.status',
                'wanted_ads.offers_count',
                'wanted_ads.created_at',
                'offers.public_id as provider_offer_public_id',
                'offers.status as provider_offer_status',
            ])
            ->orderByDesc('wanted_ads.created_at')
            ->get();

        return $this->jsonResponse(
            true,
            'Active wanted advertisements retrieved successfully.',
            [
                'provider_public_id' =>
                    $provider->public_id,
                'items' => $wantedAds,
                'total' => $wantedAds->count(),
            ]
        );
    }

    public function show(
        string $providerPublicId,
        string $wantedAdPublicId
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

        $wantedAd = $this->baseWantedAdQuery()
            ->leftJoin('offers', function ($join) use (
                $provider
            ): void {
                $join->on(
                    'offers.wanted_ad_id',
                    '=',
                    'wanted_ads.id'
                )->where(
                    'offers.provider_id',
                    '=',
                    $provider->id
                );
            })
            ->where(
                'wanted_ads.public_id',
                $wantedAdPublicId
            )
            ->select([
                'wanted_ads.id',
                'wanted_ads.public_id',
                'wanted_ads.category_id',
                'categories.public_id as category_public_id',
                'categories.name as category_name',
                'wanted_ads.title',
                'wanted_ads.description',
                'wanted_ads.district',
                'wanted_ads.budget_display',
                'wanted_ads.deadline_display',
                'wanted_ads.status',
                'wanted_ads.offers_count',
                'wanted_ads.created_at',
                'wanted_ads.updated_at',
                'offers.public_id as provider_offer_public_id',
                'offers.status as provider_offer_status',
            ])
            ->first();

        if (!$wantedAd) {
            return $this->jsonResponse(
                false,
                'Wanted advertisement not found.',
                null,
                null,
                404
            );
        }

        return $this->jsonResponse(
            true,
            'Wanted advertisement retrieved successfully.',
            [
                'wanted_ad' => $wantedAd,
                'privacy' => [
                    'customer_name_hidden' => true,
                    'customer_phone_hidden' => true,
                    'customer_email_hidden' => true,
                    'exact_address_hidden' => true,
                ],
            ]
        );
    }
}