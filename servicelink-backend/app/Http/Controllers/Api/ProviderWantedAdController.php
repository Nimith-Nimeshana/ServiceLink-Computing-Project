<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
class ProviderWantedAdController extends Controller
{
    private function jsonResponse(bool $success, string $message, mixed $data=null, mixed $errors=null, int $status=200): JsonResponse { return response()->json(['success'=>$success,'message'=>$message,'data'=>$data,'errors'=>$errors], $status); }
    private function findProvider(string $providerPublicId): ?object { return DB::table('users')->where('public_id',$providerPublicId)->where('role','provider')->first(); }
    
    private function computeBudget($ad): string
    {
        $type = $ad->budget_type ?? null;
        $min = $ad->budget_min ?? null;
        $max = $ad->budget_max ?? null;
        if ($type === 'negotiable') return 'Negotiable';
        if ($type === 'range' && $min !== null && $max !== null) return 'LKR '.number_format((float)$min).' - '.number_format((float)$max);
        if ($type === 'range' && $min !== null) return 'LKR '.number_format((float)$min).' - '.number_format((float)($max ?? $min));
        if ($type === 'fixed' && $min !== null) return 'LKR '.number_format((float)$min);
        if ($type === 'fixed' && $max !== null) return 'LKR '.number_format((float)$max);
        if ($min !== null && $max !== null && $min != $max) return 'LKR '.number_format((float)$min).' - '.number_format((float)$max);
        if ($min !== null) return 'LKR '.number_format((float)$min);
        $display = $ad->budget_display ?? null;
        if ($display && $display !== 'LKR 8,000 - 12,000') return $display;
        return 'Negotiable';
    }

    private function computeDeadline($ad): string
    {
        $raw = $ad->offer_deadline ?? $ad->deadline_display ?? $ad->deadline_date ?? $ad->preferred_date ?? null;
        if (!$raw) return 'Open';
        try { return date('d M Y', strtotime($raw)); } catch (\Exception $e) { return $raw; }
    }

    public function index(string $providerPublicId): JsonResponse
    {
        $provider=$this->findProvider($providerPublicId); if(!$provider) return $this->jsonResponse(false,'Provider account not found.',null,null,404);
        $wantedAds=DB::table('wanted_ads')->leftJoin('categories','wanted_ads.category_id','=','categories.id')->leftJoin('offers', function($join) use ($provider){ $join->on('offers.wanted_ad_id','=','wanted_ads.id')->where('offers.provider_id','=',$provider->id); })->where('wanted_ads.status','active')->whereNull('wanted_ads.deleted_at')->select(['wanted_ads.*','categories.name as category_name','categories.public_id as category_public_id','offers.public_id as provider_offer_public_id','offers.status as provider_offer_status'])->orderByDesc('wanted_ads.created_at')->get()->map(function($ad){
            return [
                'id'=>$ad->id,
                'public_id'=>$ad->public_id,
                'category_id'=>$ad->category_id,
                'category_public_id'=>$ad->category_public_id,
                'category_name'=>$ad->category_name??'General',
                'title'=>$ad->title,
                'description'=>$ad->description,
                'district'=>$ad->district??$ad->general_area??'Not specified',
                // FIX V2: computed budget, not raw budget_display
                'budget_display'=>$this->computeBudget($ad),
                'budget_type'=>$ad->budget_type??null,
                'budget_min'=>$ad->budget_min??null,
                'budget_max'=>$ad->budget_max??null,
                'deadline_display'=>$this->computeDeadline($ad),
                'offer_deadline'=>$ad->offer_deadline??null,
                'status'=>$ad->status,
                'offers_count'=>$ad->offers_count??0,
                'created_at'=>$ad->created_at,
                'provider_offer_public_id'=>$ad->provider_offer_public_id,
                'provider_offer_status'=>$ad->provider_offer_status,
            ];
        });
        return $this->jsonResponse(true,'Active wanted advertisements retrieved successfully.',['provider_public_id'=>$provider->public_id,'items'=>$wantedAds,'total'=>$wantedAds->count()]);
    }

    public function show(string $providerPublicId, string $wantedAdPublicId): JsonResponse
    {
        $provider=$this->findProvider($providerPublicId); if(!$provider) return $this->jsonResponse(false,'Provider account not found.',null,null,404);
        $ad=DB::table('wanted_ads')->leftJoin('categories','wanted_ads.category_id','=','categories.id')->leftJoin('offers', function($join) use ($provider){ $join->on('offers.wanted_ad_id','=','wanted_ads.id')->where('offers.provider_id','=',$provider->id); })->where('wanted_ads.public_id',$wantedAdPublicId)->whereNull('wanted_ads.deleted_at')->select(['wanted_ads.*','categories.name as category_name','categories.public_id as category_public_id','offers.public_id as provider_offer_public_id','offers.status as provider_offer_status'])->first();
        if(!$ad) return $this->jsonResponse(false,'Wanted advertisement not found.',null,null,404);
        $formatted=[
            'id'=>$ad->id,
            'public_id'=>$ad->public_id,
            'category_id'=>$ad->category_id,
            'category_public_id'=>$ad->category_public_id,
            'category_name'=>$ad->category_name??'General',
            'title'=>$ad->title,
            'description'=>$ad->description,
            'district'=>$ad->district??$ad->general_area??'Not specified',
            'budget_display'=>$this->computeBudget($ad),
            'budget_type'=>$ad->budget_type??null,
            'budget_min'=>$ad->budget_min??null,
            'budget_max'=>$ad->budget_max??null,
            'deadline_display'=>$this->computeDeadline($ad),
            'offer_deadline'=>$ad->offer_deadline??null,
            'status'=>$ad->status,
            'offers_count'=>$ad->offers_count??0,
            'created_at'=>$ad->created_at,
            'updated_at'=>$ad->updated_at,
            'provider_offer_public_id'=>$ad->provider_offer_public_id,
            'provider_offer_status'=>$ad->provider_offer_status,
        ];
        return $this->jsonResponse(true,'Wanted advertisement retrieved successfully.',['wanted_ad'=>$formatted,'privacy'=>['customer_name_hidden'=>true,'customer_phone_hidden'=>true,'customer_email_hidden'=>true,'exact_address_hidden'=>true],]);
    }
}
