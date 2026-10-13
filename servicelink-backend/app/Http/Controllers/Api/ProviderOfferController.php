<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProviderOfferRequest;
use App\Http\Requests\UpdateProviderOfferRequest;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use App\Helpers\NotificationHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class ProviderOfferController extends Controller
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

    private function createPublicId(): string
    {
        do {
            $publicId =
                'OF-' . strtoupper(Str::random(10));
        } while (
            DB::table('offers')
                ->where('public_id', $publicId)
                ->exists()
        );

        return $publicId;
    }

    private function offerResponse(
        string $offerPublicId,
        int $providerId
    ): ?object {
        return DB::table('offers')
            ->join(
                'wanted_ads',
                'offers.wanted_ad_id',
                '=',
                'wanted_ads.id'
            )
            ->join(
                'categories',
                'wanted_ads.category_id',
                '=',
                'categories.id'
            )
            ->where(
                'offers.public_id',
                $offerPublicId
            )
            ->where(
                'offers.provider_id',
                $providerId
            )
            ->select([
                'offers.id',
                'offers.public_id',
                'offers.wanted_ad_id',
                'wanted_ads.public_id as wanted_ad_public_id',
                'wanted_ads.title as wanted_ad_title',
                'wanted_ads.district',
                'wanted_ads.budget_display',
                'wanted_ads.deadline_display',
                'wanted_ads.status as wanted_ad_status',
                'categories.public_id as category_public_id',
                'categories.name as category_name',
                'offers.provider_id',
                'offers.proposed_price',
                'offers.proposed_date',
                'offers.proposed_time',
                'offers.duration_minutes',
                'offers.message',
                'offers.terms',
                'offers.expires_on',
                'offers.status',
                'offers.customer_response',
                'offers.booking_id',
                'offers.created_at',
                'offers.updated_at',
            ])
            ->first();
    }

    private function recalculateOfferCount(
        int $wantedAdId
    ): void {
        $count = DB::table('offers')
            ->where('wanted_ad_id', $wantedAdId)
            ->whereNotIn('status', [
                'withdrawn',
            ])
            ->count();

        DB::table('wanted_ads')
            ->where('id', $wantedAdId)
            ->update([
                'offers_count' => $count,
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

        $offers = DB::table('offers')
            ->join(
                'wanted_ads',
                'offers.wanted_ad_id',
                '=',
                'wanted_ads.id'
            )
            ->join(
                'categories',
                'wanted_ads.category_id',
                '=',
                'categories.id'
            )
            ->where(
                'offers.provider_id',
                $provider->id
            )
            ->select([
                'offers.id',
                'offers.public_id',
                'wanted_ads.public_id as wanted_ad_public_id',
                'wanted_ads.title as wanted_ad_title',
                'wanted_ads.district',
                'wanted_ads.budget_display',
                'categories.name as category_name',
                'offers.proposed_price',
                'offers.proposed_date',
                'offers.proposed_time',
                'offers.duration_minutes',
                'offers.expires_on',
                'offers.status',
                'offers.customer_response',
                'offers.booking_id',
                'offers.created_at',
                'offers.updated_at',
            ])
            ->orderByDesc('offers.created_at')
            ->get();

        return $this->jsonResponse(
            true,
            'Provider offers retrieved successfully.',
            [
                'provider_public_id' =>
                    $provider->public_id,
                'items' => $offers,
                'total' => $offers->count(),
            ]
        );
    }

    public function show(
        string $providerPublicId,
        string $offerPublicId
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

        $offer = $this->offerResponse(
            $offerPublicId,
            $provider->id
        );

        if (!$offer) {
            return $this->jsonResponse(
                false,
                'Offer not found.',
                null,
                null,
                404
            );
        }

        return $this->jsonResponse(
            true,
            'Provider offer retrieved successfully.',
            $offer
        );
    }

    public function store(
        StoreProviderOfferRequest $request,
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

        $wantedAd = DB::table('wanted_ads')
            ->where('public_id', $wantedAdPublicId)
            ->where('status', 'active')
            ->first();

        if (!$wantedAd) {
            return $this->jsonResponse(
                false,
                'Wanted advertisement not found or unavailable.',
                null,
                null,
                404
            );
        }

        $existingOffer = DB::table('offers')
            ->where(
                'wanted_ad_id',
                $wantedAd->id
            )
            ->where(
                'provider_id',
                $provider->id
            )
            ->first();

        if ($existingOffer) {
            return $this->jsonResponse(
                false,
                'You have already submitted an offer for this wanted advertisement.',
                [
                    'offer_public_id' =>
                        $existingOffer->public_id,
                    'current_status' =>
                        $existingOffer->status,
                ],
                null,
                409
            );
        }

        $validated = $request->validated();
        $publicId = $this->createPublicId();

        try {
            DB::transaction(function () use (
                $validated,
                $publicId,
                $provider,
                $wantedAd
            ): void {
                DB::table('offers')->insert([
                    'public_id' => $publicId,
                    'wanted_ad_id' =>
                        $wantedAd->id,
                    'provider_id' =>
                        $provider->id,
                    'proposed_price' =>
                        $validated['proposed_price'],
                    'proposed_date' =>
                        $validated['proposed_date'],
                    'proposed_time' =>
                        $validated['proposed_time'],
                    'duration_minutes' =>
                        $validated['duration_minutes'],
                    'message' =>
                        $validated['message'] ?? null,
                    'terms' =>
                        $validated['terms'] ?? null,
                    'expires_on' =>
                        $validated['expires_on'] ??
                        null,
                    'status' => 'submitted',
                    'customer_response' => null,
                    'booking_id' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $this->recalculateOfferCount(
                    $wantedAd->id
                );
            });
        } catch (QueryException $exception) {
            report($exception);

            if (
                str_contains(
                    strtolower($exception->getMessage()),
                    'offers_ad_provider_unique'
                )
            ) {
                return $this->jsonResponse(
                    false,
                    'You have already submitted an offer for this wanted advertisement.',
                    null,
                    null,
                    409
                );
            }

            return $this->jsonResponse(
                false,
                'The offer could not be submitted.',
                null,
                null,
                500
            );
        } catch (Throwable $exception) {
            report($exception);

            return $this->jsonResponse(
                false,
                'The offer could not be submitted.',
                null,
                null,
                500
            );
        }

        // NOTIFICATION: Notify customer about new offer
        try {
            $customer = DB::table('wanted_ads')->join('users', 'wanted_ads.customer_id', '=', 'users.id')->where('wanted_ads.id', $wantedAd->id)->select('users.id')->first();
            if ($customer) {
                NotificationHelper::create(
                    $customer->id,
                    'offer',
                    'New offer received',
                    $provider->name . ' submitted an offer for your wanted ad "' . $wantedAd->title . '" (' . $wantedAdPublicId . ').',
                    'offer',
                    $publicId,
                    '/customer/offers/' . $publicId
                );
            }
        } catch (\Exception $e) {}

        return $this->jsonResponse(
            true,
            'Offer submitted successfully.',
            $this->offerResponse(
                $publicId,
                $provider->id
            ),
            null,
            201
        );
    }

    public function update(
        UpdateProviderOfferRequest $request,
        string $providerPublicId,
        string $offerPublicId
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

        $offer = DB::table('offers')
            ->where('public_id', $offerPublicId)
            ->where('provider_id', $provider->id)
            ->first();

        if (!$offer) {
            return $this->jsonResponse(
                false,
                'Offer not found.',
                null,
                null,
                404
            );
        }

        if ($offer->status !== 'submitted') {
            return $this->jsonResponse(
                false,
                'Only submitted offers can be edited.',
                [
                    'offer_public_id' =>
                        $offer->public_id,
                    'current_status' =>
                        $offer->status,
                ],
                null,
                409
            );
        }

        $wantedAd = DB::table('wanted_ads')
            ->where('id', $offer->wanted_ad_id)
            ->first();

        if (
            !$wantedAd
            || $wantedAd->status !== 'active'
        ) {
            return $this->jsonResponse(
                false,
                'The wanted advertisement is no longer available.',
                null,
                null,
                409
            );
        }

        $validated = $request->validated();
        $updates = [];

        foreach (
            [
                'proposed_price',
                'proposed_date',
                'proposed_time',
                'duration_minutes',
                'message',
                'terms',
                'expires_on',
            ] as $field
        ) {
            if (
                array_key_exists(
                    $field,
                    $validated
                )
            ) {
                $updates[$field] =
                    $validated[$field];
            }
        }

        if (empty($updates)) {
            return $this->jsonResponse(
                false,
                'No offer changes were supplied.',
                null,
                null,
                422
            );
        }

        $updates['updated_at'] = now();

        try {
            DB::table('offers')
                ->where('id', $offer->id)
                ->update($updates);
        } catch (Throwable $exception) {
            report($exception);

            return $this->jsonResponse(
                false,
                'The offer could not be updated.',
                null,
                null,
                500
            );
        }

        return $this->jsonResponse(
            true,
            'Offer updated successfully.',
            $this->offerResponse(
                $offerPublicId,
                $provider->id
            )
        );
    }

    public function withdraw(
        string $providerPublicId,
        string $offerPublicId
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

        $offer = DB::table('offers')
            ->where('public_id', $offerPublicId)
            ->where('provider_id', $provider->id)
            ->first();

        if (!$offer) {
            return $this->jsonResponse(
                false,
                'Offer not found.',
                null,
                null,
                404
            );
        }

        if ($offer->status !== 'submitted') {
            return $this->jsonResponse(
                false,
                'Only submitted offers can be withdrawn.',
                [
                    'offer_public_id' =>
                        $offer->public_id,
                    'current_status' =>
                        $offer->status,
                ],
                null,
                409
            );
        }

        try {
            DB::transaction(function () use (
                $offer
            ): void {
                DB::table('offers')
                    ->where('id', $offer->id)
                    ->update([
                        'status' => 'withdrawn',
                        'updated_at' => now(),
                    ]);

                $this->recalculateOfferCount(
                    $offer->wanted_ad_id
                );
            });
        } catch (Throwable $exception) {
            report($exception);

            return $this->jsonResponse(
                false,
                'The offer could not be withdrawn.',
                null,
                null,
                500
            );
        }

        return $this->jsonResponse(
            true,
            'Offer withdrawn successfully.',
            $this->offerResponse(
                $offerPublicId,
                $provider->id
            )
        );
    }
}