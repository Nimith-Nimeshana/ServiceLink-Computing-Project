<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Databse table from mitigate
class CustomerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'district',
        'address_line_1',
        'address_line_2',
        'city',
        'preferred_contact_method',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}