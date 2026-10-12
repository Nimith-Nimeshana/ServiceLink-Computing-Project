<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('complaints', function (
            Blueprint $table
        ): void {
            $table->foreignId('booking_id')
                ->nullable()
                ->after('against_user_id')
                ->constrained('bookings')
                ->nullOnDelete();

            $table->index(
                [
                    'against_user_id',
                    'status',
                ],
                'complaints_against_status_index'
            );

            $table->index(
                [
                    'booking_id',
                    'status',
                ],
                'complaints_booking_status_index'
            );
        });

        DB::table('complaints')
            ->orderBy('id')
            ->each(function (object $complaint): void {
                $bookingId = DB::table('bookings')
                    ->where(
                        'public_id',
                        $complaint->record_reference
                    )
                    ->value('id');

                if ($bookingId === null) {
                    return;
                }

                DB::table('complaints')
                    ->where('id', $complaint->id)
                    ->update([
                        'booking_id' => $bookingId,
                        'updated_at' => now(),
                    ]);
            });
    }

    public function down(): void
    {
        Schema::table('complaints', function (
            Blueprint $table
        ): void {
            $table->dropIndex(
                'complaints_against_status_index'
            );

            $table->dropIndex(
                'complaints_booking_status_index'
            );

            $table->dropForeign([
                'booking_id',
            ]);

            $table->dropColumn('booking_id');
        });
    }
};