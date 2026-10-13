<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CustomerWantedAdController extends Controller
{
    private function genPublicId(): string
    {
        do {
            $id = 'WA-' . strtoupper(Str::random(6)) . random_int(100, 999);
        } while (DB::table('wanted_ads')->where('public_id', $id)->exists());
        return $id;
    }

    private function computeBudgetDisplay(string $type, $min, $max): string
    {
        if ($type === 'negotiable') return 'Negotiable';
        if ($type === 'range') {
            if ($min !== null && $max !== null) return 'LKR ' . number_format((float)$min) . ' - ' . number_format((float)$max);
            if ($min !== null) return 'LKR ' . number_format((float)$min);
            if ($max !== null) return 'LKR ' . number_format((float)$max);
            return 'Negotiable';
        }
        // fixed
        if ($min !== null) return 'LKR ' . number_format((float)$min);
        if ($max !== null) return 'LKR ' . number_format((float)$max);
        return 'Negotiable';
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $ads = DB::table('wanted_ads')->where('customer_id', $user->id)->orderByDesc('created_at')->get();
        return response()->json(['success' => true, 'data' => $ads]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $v = Validator::make($request->all(), [
            'title' => 'required|string|max:191',
            'category_id' => 'required|exists:categories,id',
            'description' => 'required|string|min:10',
            'district' => 'required|string|max:100',
            'exact_address' => 'nullable|string|max:255',
            'budget_type' => 'required|in:fixed,range,negotiable',
            'budget_min' => 'nullable|numeric|min:0',
            'budget_max' => 'nullable|numeric|min:0',
            'preferred_date' => 'nullable|date|after_or_equal:today',
            'offer_deadline' => 'required|date|after:today',
        ]);
        if ($v->fails()) return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $v->errors()], 422);
        
        $data = $v->validated();
        $data['public_id'] = $this->genPublicId();
        $data['customer_id'] = $user->id;
        $data['status'] = 'active';
        $data['published_at'] = now();
        $data['offers_count'] = 0;

        // FIX: Only set old columns if they actually exist in DB - prevents 1054 error
        // This also fixes LKR 8,000 - 12,000 bug for public/provider pages
        try {
            if (Schema::hasColumn('wanted_ads', 'budget_display')) {
                $data['budget_display'] = $this->computeBudgetDisplay($data['budget_type'], $data['budget_min'] ?? null, $data['budget_max'] ?? null);
            }
            if (Schema::hasColumn('wanted_ads', 'deadline_display')) {
                $data['deadline_display'] = $data['offer_deadline'] ? date('d M Y', strtotime($data['offer_deadline'])) : null;
            }
            // general_area does NOT exist in current schema - do NOT insert it
        } catch (\Exception $e) {
            // ignore schema check failure
        }
        
        $id = DB::table('wanted_ads')->insertGetId(array_merge($data, ['created_at' => now(), 'updated_at' => now()]));
        $ad = DB::table('wanted_ads')->where('id', $id)->first();
        return response()->json(['success' => true, 'message' => 'Wanted ad published', 'data' => $ad], 201);
    }

    public function show(Request $request, $publicId)
    {
        $user = $request->user();
        $ad = DB::table('wanted_ads')
            ->leftJoin('categories','categories.id','=','wanted_ads.category_id')
            ->where('wanted_ads.public_id', $publicId)
            ->where('wanted_ads.customer_id', $user->id)
            ->select('wanted_ads.*','categories.name as category_name')
            ->first();
        if (!$ad) return response()->json(['success' => false, 'message' => 'Not found'], 404);
        return response()->json(['success' => true, 'data' => $ad]);
    }

    public function update(Request $request, $publicId)
    {
        $user = $request->user();
        $ad = DB::table('wanted_ads')->where('public_id', $publicId)->where('customer_id', $user->id)->first();
        if (!$ad) return response()->json(['success' => false, 'message' => 'Not found'], 404);
        if (!in_array($ad->status, ['draft', 'active'])) {
            return response()->json(['success' => false, 'message' => 'Only draft or active ads can be edited'], 422);
        }
        $v = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:191',
            'category_id' => 'sometimes|exists:categories,id',
            'description' => 'sometimes|string|min:10',
            'district' => 'sometimes|string|max:100',
            'exact_address' => 'nullable|string|max:255',
            'budget_type' => 'sometimes|in:fixed,range,negotiable',
            'budget_min' => 'nullable|numeric|min:0',
            'budget_max' => 'nullable|numeric|min:0',
            'preferred_date' => 'nullable|date',
            'offer_deadline' => 'sometimes|date|after:today',
        ]);
        if ($v->fails()) return response()->json(['success' => false, 'errors' => $v->errors()], 422);
        
        $validated = $v->validated();
        
        // Update budget_display if column exists and budget changed
        try {
            if ((isset($validated['budget_type']) || isset($validated['budget_min']) || isset($validated['budget_max'])) && Schema::hasColumn('wanted_ads', 'budget_display')) {
                $type = $validated['budget_type'] ?? $ad->budget_type;
                $min = $validated['budget_min'] ?? $ad->budget_min;
                $max = $validated['budget_max'] ?? $ad->budget_max;
                $validated['budget_display'] = $this->computeBudgetDisplay($type, $min, $max);
            }
            if (isset($validated['offer_deadline']) && Schema::hasColumn('wanted_ads', 'deadline_display')) {
                $validated['deadline_display'] = date('d M Y', strtotime($validated['offer_deadline']));
            }
        } catch (\Exception $e) {}

        DB::table('wanted_ads')->where('id', $ad->id)->update(array_merge($validated, ['updated_at' => now()]));
        $updated = DB::table('wanted_ads')->where('id', $ad->id)->first();
        return response()->json(['success' => true, 'message' => 'Updated', 'data' => $updated]);
    }

    public function destroy(Request $request, $publicId)
    {
        $user = $request->user();
        $ad = DB::table('wanted_ads')->where('public_id', $publicId)->where('customer_id', $user->id)->first();
        if (!$ad) return response()->json(['success' => false, 'message' => 'Not found'], 404);
        DB::table('wanted_ads')->where('id', $ad->id)->update(['status' => 'closed', 'updated_at' => now()]);
        return response()->json(['success' => true, 'message' => 'Wanted ad closed']);
    }

    public function offers(Request $request, $publicId)
    {
        $user = $request->user();
        $ad = DB::table('wanted_ads')->where('public_id', $publicId)->where('customer_id', $user->id)->first();
        if (!$ad) return response()->json(['success' => false, 'message' => 'Not found'], 404);
        $offers = DB::table('offers')
            ->join('users', 'users.id', '=', 'offers.provider_id')
            ->where('wanted_ad_id', $ad->id)
            ->select('offers.*', 'users.name as provider_name', 'users.public_id as provider_public_id')
            ->orderByDesc('offers.created_at')
            ->get();
        return response()->json(['success' => true, 'data' => $offers, 'ad' => $ad]);
    }

    public function showOffer(Request $request, $offerPublicId)
    {
        $user = $request->user();
        $offer = DB::table('offers')
            ->join('wanted_ads','wanted_ads.id','=','offers.wanted_ad_id')
            ->join('users','users.id','=','offers.provider_id')
            ->where('offers.public_id',$offerPublicId)
            ->where('wanted_ads.customer_id',$user->id)
            ->select('offers.*','users.name as provider_name','users.public_id as provider_public_id','wanted_ads.public_id as wanted_ad_public_id','wanted_ads.title as wanted_ad_title')
            ->first();
        if (!$offer) return response()->json(['success'=>false,'message'=>'Offer not found'],404);
        return response()->json(['success'=>true,'data'=>$offer]);
    }

    public function declineOffer(Request $request, $publicId, $offerPublicId)
    {
        $user = $request->user();
        $ad = DB::table('wanted_ads')->where('public_id',$publicId)->where('customer_id',$user->id)->first();
        if (!$ad) return response()->json(['success'=>false,'message'=>'Ad not found'],404);
        $offer = DB::table('offers')->where('public_id',$offerPublicId)->where('wanted_ad_id',$ad->id)->first();
        if (!$offer) return response()->json(['success'=>false,'message'=>'Offer not found'],404);
        if ($offer->status !== 'submitted') {
            return response()->json(['success'=>false,'message'=>'Offer not eligible for decline, current status: '.$offer->status],409);
        }
        if ($offer->expires_on && strtotime($offer->expires_on) < time()) {
            return response()->json(['success'=>false,'message'=>'Offer expired'],422);
        }
        DB::table('offers')->where('id',$offer->id)->update(['status'=>'declined','customer_response'=>$request->input('customer_response_note'),'updated_at'=>now()]);
        return response()->json(['success'=>true,'message'=>'Offer declined']);
    }

    public function acceptOffer(Request $request, $publicId, $offerPublicId)
    {
        $user = $request->user();
        return DB::transaction(function () use ($user, $publicId, $offerPublicId, $request) {
            $ad = DB::table('wanted_ads')->where('public_id', $publicId)->where('customer_id', $user->id)->lockForUpdate()->first();
            if (!$ad) return response()->json(['success' => false, 'message' => 'Ad not found'], 404);
            if ($ad->status !== 'active') return response()->json(['success' => false, 'message' => 'Ad not active'], 422);
            
            $offer = DB::table('offers')->where('public_id', $offerPublicId)->where('wanted_ad_id', $ad->id)->where('status', 'submitted')->lockForUpdate()->first();
            if (!$offer) return response()->json(['success' => false, 'message' => 'Offer not eligible'], 404);
            if ($offer->expires_on && strtotime($offer->expires_on) < strtotime(date('Y-m-d'))) {
                return response()->json(['success'=>false,'message'=>'Offer expired'],422);
            }
            
            $bookingPublicId = 'BK-' . strtoupper(Str::random(6)) . random_int(100, 999);
            $agreed = $offer->proposed_price;
            $rate = 10.00;
            $commission = round($agreed * $rate / 100, 2);
            $net = round($agreed - $commission, 2);
            
            $bookingId = DB::table('bookings')->insertGetId([
                'public_id' => $bookingPublicId,
                'customer_id' => $user->id,
                'provider_id' => $offer->provider_id,
                'title' => $ad->title,
                'source' => 'Accepted offer',
                'date_display' => $offer->proposed_date,
                'agreed_amount' => $agreed,
                'commission_rate' => $rate,
                'commission_amount' => $commission,
                'provider_net_amount' => $net,
                'status' => 'accepted',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            DB::table('offers')->where('id', $offer->id)->update(['status' => 'accepted', 'customer_response'=>$request->input('customer_response_note'), 'booking_id'=>$bookingId, 'updated_at' => now()]);
            DB::table('offers')->where('wanted_ad_id', $ad->id)->where('id', '!=', $offer->id)->where('status', 'submitted')->update(['status' => 'declined', 'updated_at' => now()]);
            DB::table('wanted_ads')->where('id', $ad->id)->update(['status' => 'offer_accepted', 'accepted_offer_id' => $offer->id, 'updated_at' => now()]);
            
            DB::table('booking_status_histories')->insert([
                'booking_id' => $bookingId,
                'from_status' => null,
                'to_status' => 'accepted',
                'changed_by' => $user->id,
                'changed_by_role' => 'customer',
                'note' => 'Booking from accepted offer ' . $offer->public_id,
                'changed_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            try {
                \App\Helpers\NotificationHelper::create(
                    $offer->provider_id,
                    'offer',
                    'Offer accepted!',
                    'Your offer ' . $offer->public_id . ' for "' . $ad->title . '" was accepted. Booking ' . $bookingPublicId . ' created.',
                    'booking',
                    $bookingPublicId,
                    '/provider/bookings/' . $bookingPublicId
                );
                \App\Helpers\NotificationHelper::create(
                    $user->id,
                    'booking',
                    'Booking confirmed',
                    'You accepted an offer for "' . $ad->title . '". Booking ' . $bookingPublicId . ' is now confirmed.',
                    'booking',
                    $bookingPublicId,
                    '/customer/bookings/' . $bookingPublicId
                );
            } catch (\Exception $e) {}
            
            $booking = DB::table('bookings')->where('id', $bookingId)->first();
            return response()->json(['success' => true, 'message' => 'Offer accepted, booking created', 'data' => $booking], 201);
        });
    }

    public function categories(Request $request)
    {
        $cats = DB::table('categories')->where('status', 'active')->orderBy('sort_order')->get();
        return response()->json(['success' => true, 'data' => $cats]);
    }

    public function allOffers(Request $request)
    {
        $user = $request->user();
        $offers = DB::table('offers')
            ->join('wanted_ads','wanted_ads.id','=','offers.wanted_ad_id')
            ->join('users','users.id','=','offers.provider_id')
            ->where('wanted_ads.customer_id',$user->id)
            ->whereNull('wanted_ads.deleted_at')
            ->select('offers.*','users.name as provider_name','users.public_id as provider_public_id','wanted_ads.public_id as wanted_ad_public_id','wanted_ads.title as wanted_ad_title')
            ->orderByDesc('offers.created_at')
            ->get();
        return response()->json(['success'=>true,'data'=>$offers]);
    }
}
