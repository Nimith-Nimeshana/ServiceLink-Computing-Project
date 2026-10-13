<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WantedAd extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'public_id',
        'customer_id',
        'category_id',
        'title',
        'description',
        'district',
        'exact_address',
        'budget_type',
        'budget_min',
        'budget_max',
        'preferred_date',
        'offer_deadline',
        'status',
        'published_at',
        'accepted_offer_id',
        'offers_count',
    ];

    protected $casts = [
        'budget_min' => 'decimal:2',
        'budget_max' => 'decimal:2',
        'preferred_date' => 'date',
        'offer_deadline' => 'datetime',
        'published_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function offers()
    {
        return $this->hasMany(Offer::class, 'wanted_ad_id');
    }

    public function acceptedOffer()
    {
        return $this->belongsTo(Offer::class, 'accepted_offer_id');
    }
}
