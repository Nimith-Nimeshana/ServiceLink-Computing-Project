<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CustomerDashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();

        $bookingsTotal = DB::table('bookings')->where('customer_id', $user->id)->count();
        $bookingsAccepted = DB::table('bookings')->where('customer_id', $user->id)->where('status', 'accepted')->count();
        $bookingsCompleted = DB::table('bookings')->where('customer_id', $user->id)->where('status', 'completed')->count();
        $bookingsCancelled = DB::table('bookings')->where('customer_id', $user->id)->where('status', 'cancelled')->count();

        $wantedTotal = DB::table('wanted_ads')->where('customer_id', $user->id)->count();
        $wantedActive = DB::table('wanted_ads')->where('customer_id', $user->id)->where('status', 'active')->count();
        $wantedOfferAccepted = DB::table('wanted_ads')->where('customer_id', $user->id)->where('status', 'offer_accepted')->count();
        $wantedClosed = DB::table('wanted_ads')->where('customer_id', $user->id)->whereIn('status', ['closed', 'expired'])->count();

        $offersQuery = DB::table('offers')
            ->join('wanted_ads', 'wanted_ads.id', '=', 'offers.wanted_ad_id')
            ->where('wanted_ads.customer_id', $user->id);

        $offersTotal = (clone $offersQuery)->count();
        $offersPending = (clone $offersQuery)->where('offers.status', 'submitted')->count();
        $offersAccepted = (clone $offersQuery)->where('offers.status', 'accepted')->count();
        $offersDeclined = (clone $offersQuery)->where('offers.status', 'declined')->count();

        // Original table uses read_at NULL for unread, not is_read
        // Handles both old schema and SAFE migration schema
        try {
            if (Schema::hasTable('notifications')) {
                if (Schema::hasColumn('notifications', 'is_read')) {
                    $unreadAlerts = DB::table('notifications')
                        ->where('user_id', $user->id)
                        ->where(function($q) {
                            $q->where('is_read', false)->orWhereNull('read_at');
                        })->count();
                } else {
                    $unreadAlerts = DB::table('notifications')
                        ->where('user_id', $user->id)
                        ->whereNull('read_at')->count();
                }
            } else {
                $unreadAlerts = 0;
            }
        } catch (\Exception $e) {
            $unreadAlerts = 0;
        }

        $recentBookings = DB::table('bookings')
            ->leftJoin('users as provider', 'provider.id', '=', 'bookings.provider_id')
            ->where('bookings.customer_id', $user->id)
            ->select('bookings.*', 'provider.name as provider_name')
            ->orderByDesc('bookings.created_at')->limit(3)->get();

        $recentWantedAds = DB::table('wanted_ads')
            ->where('customer_id', $user->id)
            ->orderByDesc('created_at')->limit(3)->get();

        $recentOffers = DB::table('offers')
            ->join('wanted_ads', 'wanted_ads.id', '=', 'offers.wanted_ad_id')
            ->join('users as provider', 'provider.id', '=', 'offers.provider_id')
            ->where('wanted_ads.customer_id', $user->id)
            ->select('offers.*', 'provider.name as provider_name', 'wanted_ads.public_id as wanted_ad_public_id', 'wanted_ads.title as wanted_ad_title')
            ->orderByDesc('offers.created_at')->limit(3)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'upcoming_bookings' => $bookingsAccepted,
                'active_wanted_ads' => $wantedActive,
                'offers_received' => $offersPending,
                'unread_alerts' => $unreadAlerts,
                'bookings' => [
                    'total' => $bookingsTotal,
                    'accepted' => $bookingsAccepted,
                    'completed' => $bookingsCompleted,
                    'cancelled' => $bookingsCancelled,
                ],
                'wanted_ads' => [
                    'total' => $wantedTotal,
                    'active' => $wantedActive,
                    'offer_accepted' => $wantedOfferAccepted,
                    'closed' => $wantedClosed,
                ],
                'offers' => [
                    'total' => $offersTotal,
                    'pending' => $offersPending,
                    'accepted' => $offersAccepted,
                    'declined' => $offersDeclined,
                ],
                'recent_bookings' => $recentBookings,
                'recent_wanted_ads' => $recentWantedAds,
                'recent_offers' => $recentOffers,
            ]
        ]);
    }
}
