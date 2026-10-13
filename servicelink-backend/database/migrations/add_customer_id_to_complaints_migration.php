<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            // If table has user_id but not customer_id, add customer_id
            if (!Schema::hasColumn('complaints', 'customer_id')) {
                $table->unsignedBigInteger('customer_id')->nullable()->after('public_id');
            }
            // Ensure booking_id exists
            if (!Schema::hasColumn('complaints', 'booking_id')) {
                $table->unsignedBigInteger('booking_id')->nullable()->after('customer_id');
            }
            // Ensure category exists
            if (!Schema::hasColumn('complaints', 'category')) {
                $table->string('category', 100)->default('general')->after('description');
            }
            // Ensure status exists
            if (!Schema::hasColumn('complaints', 'status')) {
                $table->string('status', 50)->default('under_review')->after('category');
            }
        });

        // Copy data from user_id to customer_id if needed
        if (Schema::hasColumn('complaints', 'customer_id') && Schema::hasColumn('complaints', 'user_id')) {
            \DB::statement('UPDATE complaints SET customer_id = user_id WHERE customer_id IS NULL AND user_id IS NOT NULL');
        }
    }

    public function down(): void
    {
        // Do not drop columns in down, just leave
    }
};
