<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (
            Blueprint $table
        ): void {
            $table->unique(
                'booking_id',
                'transactions_booking_id_unique'
            );

            $table->index(
                [
                    'provider_id',
                    'status',
                ],
                'transactions_provider_status_index'
            );
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (
            Blueprint $table
        ): void {
            $table->dropUnique(
                'transactions_booking_id_unique'
            );

            $table->dropIndex(
                'transactions_provider_status_index'
            );
        });
    }
};