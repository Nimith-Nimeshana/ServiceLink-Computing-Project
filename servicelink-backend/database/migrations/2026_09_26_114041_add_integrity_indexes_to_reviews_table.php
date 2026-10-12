<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (
            Blueprint $table
        ): void {
            $table->unique(
                'booking_id',
                'reviews_booking_id_unique'
            );

            $table->index(
                [
                    'provider_id',
                    'status',
                ],
                'reviews_provider_status_index'
            );

            $table->index(
                [
                    'provider_id',
                    'rating',
                ],
                'reviews_provider_rating_index'
            );
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (
            Blueprint $table
        ): void {
            $table->dropUnique(
                'reviews_booking_id_unique'
            );

            $table->dropIndex(
                'reviews_provider_status_index'
            );

            $table->dropIndex(
                'reviews_provider_rating_index'
            );
        });
    }
};
