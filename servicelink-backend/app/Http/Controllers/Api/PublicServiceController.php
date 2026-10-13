<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
class PublicServiceController extends Controller
{
    private function jsonResponse(bool $success, string $message, mixed $data=null, mixed $errors=null, int $status=200): JsonResponse
    { return response()->json(['success'=>$success,'message'=>$message,'data'=>$data,'errors'=>$errors], $status); }

    private function computeBudget($ad): string
    {
        // FIX V2: ALWAYS prioritize new fields over old default 'LKR 8,000 - 12,000'
        $type = $ad->budget_type ?? null;
        $min = $ad->budget_min ?? null;
        $max = $ad->budget_max ?? null;

        // If new fields exist, compute from them (this fixes your bug)
        if ($type === 'negotiable') return 'Negotiable';
        if ($type === 'range' && $min !== null && $max !== null) return 'LKR '.number_format((float)$min).' - '.number_format((float)$max);
        if ($type === 'range' && $min !== null) return 'LKR '.number_format((float)$min).' - '.number_format((float)$max ?? $min);
        if ($type === 'fixed' && $min !== null) return 'LKR '.number_format((float)$min);
        if ($type === 'fixed' && $max !== null) return 'LKR '.number_format((float)$max);
        // Fallback: if type is missing but min/max exist (old ads created before type was required)
        if ($min !== null && $max !== null && $min != $max) return 'LKR '.number_format((float)$min).' - '.number_format((float)$max);
        if ($min !== null) return 'LKR '.number_format((float)$min);

        // Only use old budget_display if it's NOT the default dummy value
        $display = $ad->budget_display ?? null;
        if ($display && $display !== 'LKR 8,000 - 12,000' && $display !== 'LKR 8,000 - 12,000 ') return $display;

        return 'Negotiable';
    }

    private function computeDeadline($ad): string
    {
        $raw = $ad->offer_deadline ?? $ad->deadline_display ?? $ad->deadline_date ?? $ad->preferred_date ?? null;
        if (!$raw) return 'Open';
        try { return date('d M Y', strtotime($raw)); } catch (\Exception $e) { return $raw; }
    }

    public function index(Request $request): JsonResponse
    {
        $query=DB::table('services')->join('users','users.id','=','services.provider_id')->join('provider_applications','provider_applications.provider_id','=','users.id')->join('provider_profiles','provider_profiles.user_id','=','users.id')->leftJoin('categories','services.category_id','=','categories.id')->where('services.status','active')->where('users.role','provider')->where('users.status','active')->where('provider_applications.status','approved')->select(['services.public_id','services.title','services.slug','services.description','services.price_display','services.price_min','services.status','services.created_at','users.public_id as provider_public_id','provider_profiles.business_name as provider_business_name','provider_profiles.professional_title as provider_title','provider_profiles.primary_district','provider_profiles.average_rating','provider_profiles.review_count','categories.public_id as category_public_id','categories.name as category_name']);
        if($request->has('category') && $request->category!=='All categories' && $request->category!=='') $query->where('categories.name',$request->category);
        if($request->has('district') && $request->district!=='All locations' && $request->district!=='') $query->where('provider_profiles.primary_district',$request->district);
        if($request->has('search') && trim($request->search)!==''){ $search='%'.trim($request->search).'%'; $query->where(function($q) use($search){ $q->where('services.title','like',$search)->orWhere('services.description','like',$search)->orWhere('provider_profiles.business_name','like',$search); }); }
        $sort=$request->get('sort','Recommended'); if($sort==='Rating') $query->orderByDesc('provider_profiles.average_rating'); elseif($sort==='Price low to high') $query->orderBy('services.price_min'); else $query->orderByDesc('services.created_at');
        $services=$query->get()->map(fn($s)=>['public_id'=>$s->public_id,'id'=>$s->public_id,'title'=>$s->title,'slug'=>$s->slug,'description'=>$s->description,'price_display'=>$s->price_display,'price_min'=>(float)$s->price_min,'price'=>(float)$s->price_min,'priceLabel'=>$s->price_display,'status'=>$s->status,'provider_public_id'=>$s->provider_public_id,'providerId'=>$s->provider_public_id,'provider'=>$s->provider_business_name,'provider_name'=>$s->provider_business_name,'provider_title'=>$s->provider_title,'location'=>$s->primary_district??'Sri Lanka','primary_district'=>$s->primary_district,'rating'=>(float)($s->average_rating??0),'average_rating'=>(float)($s->average_rating??0),'reviews'=>(int)($s->review_count??0),'review_count'=>(int)($s->review_count??0),'category_name'=>$s->category_name,'category'=>$s->category_name??'General','category_public_id'=>$s->category_public_id,'available'=>true,'tone'=>'from-blue-500 to-cyan-400','created_at'=>$s->created_at]);
        return $this->jsonResponse(true,'Public services retrieved successfully.',['items'=>$services,'total'=>$services->count()]);
    }

    public function show(string $publicId): JsonResponse
    {
        $service=DB::table('services')->join('users','users.id','=','services.provider_id')->join('provider_applications','provider_applications.provider_id','=','users.id')->join('provider_profiles','provider_profiles.user_id','=','users.id')->leftJoin('categories','services.category_id','=','categories.id')->where('services.public_id',$publicId)->where('services.status','active')->where('users.role','provider')->where('users.status','active')->where('provider_applications.status','approved')->select(['services.id as service_id','services.public_id','services.title','services.slug','services.description','services.price_display','services.price_min','services.status','users.id as provider_user_id','users.public_id as provider_public_id','provider_profiles.business_name','provider_profiles.professional_title','provider_profiles.professional_summary','provider_profiles.primary_district','provider_profiles.coverage_area','provider_profiles.years_experience','provider_profiles.average_rating','provider_profiles.review_count','provider_profiles.public_email','provider_profiles.public_phone','categories.name as category_name','categories.public_id as category_public_id'])->first();
        if(!$service) return $this->jsonResponse(false,'Service not found or not available.',null,null,404);
        $availability=[]; try{ if(Schema::hasTable('availability_slots')){ $availability=DB::table('availability_slots')->where('provider_id',$service->provider_user_id)->where('status','available')->where('slot_date','>=',now()->toDateString())->orderBy('slot_date')->orderBy('start_time')->limit(10)->get(); } }catch(\Exception $e){ $availability=[]; }
        return $this->jsonResponse(true,'Service retrieved successfully.',['service'=>['public_id'=>$service->public_id,'id'=>$service->public_id,'title'=>$service->title,'slug'=>$service->slug,'description'=>$service->description,'price_display'=>$service->price_display,'price_min'=>(float)$service->price_min,'price'=>(float)$service->price_min,'priceLabel'=>$service->price_display,'status'=>$service->status,'category_name'=>$service->category_name,'category'=>$service->category_name,'provider'=>['public_id'=>$service->provider_public_id,'business_name'=>$service->business_name,'professional_title'=>$service->professional_title,'professional_summary'=>$service->professional_summary,'primary_district'=>$service->primary_district,'coverage_area'=>$service->coverage_area,'years_experience'=>$service->years_experience,'average_rating'=>(float)($service->average_rating??0),'review_count'=>(int)($service->review_count??0),'public_email'=>$service->public_email,'public_phone'=>$service->public_phone,]],'availability'=>$availability]);
    }

    public function wantedAds(Request $request): JsonResponse
    {
        try{
            $query=DB::table('wanted_ads')->join('users','users.id','=','wanted_ads.customer_id')->leftJoin('categories','wanted_ads.category_id','=','categories.id')->where('users.status','active')->where('wanted_ads.status','active')->whereNull('wanted_ads.deleted_at');
            if($request->has('category') && $request->category!=='All categories' && $request->category!=='') $query->where('categories.name',$request->category);
            if($request->has('district') && $request->district!=='All locations' && $request->district!==''){ $d=$request->district; $query->where(function($q) use($d){ $q->where('wanted_ads.district',$d); if(Schema::hasColumn('wanted_ads','general_area')) $q->orWhere('wanted_ads.general_area',$d); }); }
            $query->select(['wanted_ads.*','categories.name as category_name','categories.public_id as category_public_id'])->orderByDesc('wanted_ads.created_at');
            $raw=$query->get();
            $items=$raw->map(function($ad){
                $area=$ad->district ?? ($ad->general_area ?? null) ?? ($ad->exact_address ?? null) ?? 'Not specified';
                $budget=$this->computeBudget($ad);
                $deadline=$this->computeDeadline($ad);
                $offersCount=(int)($ad->offers_count??0); try{ if(isset($ad->id)){$rc=DB::table('offers')->where('wanted_ad_id',$ad->id)->count(); if($rc>$offersCount) $offersCount=$rc;} }catch(\Exception $e){}
                return ['public_id'=>$ad->public_id,'id'=>$ad->public_id,'title'=>$ad->title,'detail'=>$ad->description,'description'=>$ad->description,'category'=>$ad->category_name??'General','category_name'=>$ad->category_name??'General','category_public_id'=>$ad->category_public_id??null,'area'=>$area,'general_area'=>$area,'district'=>$area,'budget'=>$budget,'budget_display'=>$budget,'budget_type'=>$ad->budget_type??'fixed','budget_min'=>$ad->budget_min??null,'budget_max'=>$ad->budget_max??null,'deadline'=>$deadline,'deadline_date'=>$deadline,'deadline_display'=>$deadline,'offer_deadline'=>$ad->offer_deadline??null,'preferred_date'=>$ad->preferred_date??null,'status'=>$ad->status,'offers'=>$offersCount,'offers_count'=>$offersCount,'created_at'=>$ad->created_at,'published_at'=>$ad->published_at??$ad->created_at,];
            });
            return $this->jsonResponse(true,'Public wanted ads retrieved.',['items'=>$items,'total'=>$items->count()]);
        }catch(\Exception $e){ \Log::error('wantedAds public failed: '.$e->getMessage()); return $this->jsonResponse(false,'Failed to load wanted ads: '.$e->getMessage(),['items'=>[],'total'=>0],null,500); }
    }

    public function showWantedAd(string $publicId): JsonResponse
    {
        try{
            $ad=DB::table('wanted_ads')->leftJoin('categories','wanted_ads.category_id','=','categories.id')->where('wanted_ads.public_id',$publicId)->whereNull('wanted_ads.deleted_at')->select(['wanted_ads.*','categories.name as category_name'])->first();
            if(!$ad) return $this->jsonResponse(false,'Wanted ad not found.',null,null,404);
            $area=$ad->district ?? ($ad->general_area ?? null) ?? 'Not specified';
            $budget=$this->computeBudget($ad);
            $deadline=$this->computeDeadline($ad);
            $offersCount=(int)($ad->offers_count??0); try{ $offersCount=DB::table('offers')->where('wanted_ad_id',$ad->id)->count(); }catch(\Exception $e){}
            return $this->jsonResponse(true,'Wanted ad retrieved.',['ad'=>['public_id'=>$ad->public_id,'id'=>$ad->public_id,'title'=>$ad->title,'detail'=>$ad->description,'description'=>$ad->description,'category'=>$ad->category_name??'General','category_name'=>$ad->category_name??'General','area'=>$area,'general_area'=>$area,'district'=>$area,'budget'=>$budget,'budget_display'=>$budget,'budget_type'=>$ad->budget_type??null,'budget_min'=>$ad->budget_min??null,'budget_max'=>$ad->budget_max??null,'deadline'=>$deadline,'deadline_date'=>$deadline,'offer_deadline'=>$ad->offer_deadline??null,'status'=>$ad->status,'offers'=>$offersCount,'offers_count'=>$offersCount,'created_at'=>$ad->created_at,'published_at'=>$ad->published_at??$ad->created_at,]]);
        }catch(\Exception $e){ return $this->jsonResponse(false,'Failed: '.$e->getMessage(),null,null,500); }
    }

    public function categories(): JsonResponse
    {
        $categories=DB::table('categories')->where('status','active')->select(['id','public_id','name','slug','description'])->orderBy('sort_order')->orderBy('name')->get();
        return $this->jsonResponse(true,'Categories retrieved.',['items'=>$categories,'total'=>$categories->count()]);
    }
}
