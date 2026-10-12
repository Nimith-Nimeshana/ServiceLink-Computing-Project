<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;



class ProviderProfile extends Model

{

use HasFactory;



protected $fillable = [

'user_id',

'business_name',

'professional_title',

'professional_summary',

'primary_district',

'coverage_area',

'years_experience',

'public_email',

'public_phone',

'average_rating',

'review_count',

];



protected function casts(): array

{

return [

'years_experience' => 'integer',

'average_rating' => 'decimal:2',

'review_count' => 'integer',

];

}



public function user(): BelongsTo

{

return $this->belongsTo(User::class);

}

}