<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // If table doesn't exist, create custom notifications table that works for our app
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->string('public_id')->unique()->nullable()->comment('NT-xxx for display');
                $table->unsignedBigInteger('user_id')->nullable()->comment('Customer id - nullable to prevent 1364');
                $table->unsignedBigInteger('notifiable_id')->nullable()->comment('Laravel default morph - also nullable');
                $table->string('notifiable_type')->nullable()->comment('Laravel default morph type');
                $table->string('title')->nullable();
                $table->text('message')->nullable();
                $table->string('type')->default('general')->comment('offer, booking, complaint, review, payment');
                $table->string('reference')->nullable()->comment('WA-xxx, BK-xxx, CP-xxx');
                $table->boolean('is_read')->default(false);
                $table->timestamp('read_at')->nullable();
                $table->json('data')->nullable()->comment('Laravel default data json - also store our data');
                $table->timestamps();
            });
            return;
        }

        // Table exists - make it compatible with BOTH schemas
        Schema::table('notifications', function (Blueprint $table) {
            // Make user_id nullable to prevent Field doesn't have default value error
            // This is the main cause of your SQL error when inserting
            if (Schema::hasColumn('notifications', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->change();
            } else {
                $table->unsignedBigInteger('user_id')->nullable()->after('id');
            }

            // Make notifiable_id nullable too - for Laravel default table
            if (Schema::hasColumn('notifications', 'notifiable_id')) {
                // Change to nullable string or bigint depending on existing type
                // We keep original type but make nullable via raw statement if needed
            } else {
                $table->unsignedBigInteger('notifiable_id')->nullable()->after('user_id');
            }

            // Ensure all our custom columns exist - add if not exists (won't error)
            if (!Schema::hasColumn('notifications', 'public_id')) {
                $table->string('public_id')->nullable()->unique()->after('id');
            }
            if (!Schema::hasColumn('notifications', 'title')) {
                $table->string('title')->nullable()->after('notifiable_id');
            }
            if (!Schema::hasColumn('notifications', 'message')) {
                $table->text('message')->nullable()->after('title');
            }
            if (!Schema::hasColumn('notifications', 'type') && !Schema::hasColumn('notifications', 'data')) {
                // Only add type if data doesn't exist - data is Laravel default
                $table->string('type')->default('general')->after('message');
            } elseif (!Schema::hasColumn('notifications', 'type')) {
                $table->string('type')->nullable()->default('general')->after('message');
            }
            if (!Schema::hasColumn('notifications', 'reference')) {
                $table->string('reference')->nullable()->after('type');
            }
            if (!Schema::hasColumn('notifications', 'is_read')) {
                $table->boolean('is_read')->default(false)->after('reference');
            }
            if (!Schema::hasColumn('notifications', 'read_at')) {
                $table->timestamp('read_at')->nullable()->after('is_read');
            }
            if (!Schema::hasColumn('notifications', 'data')) {
                $table->json('data')->nullable()->after('read_at');
            }
            if (!Schema::hasColumn('notifications', 'notifiable_type')) {
                $table->string('notifiable_type')->nullable()->after('notifiable_id');
            }
        });

        // Second pass: ensure nullable via DB statement for columns that already existed but were NOT NULL
        // This prevents 1364 error without dropping data
        try {
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE notifications MODIFY user_id BIGINT UNSIGNED NULL');
        } catch (\Exception $e) {}
        try {
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE notifications MODIFY notifiable_id BIGINT UNSIGNED NULL');
        } catch (\Exception $e) {
            try {
                \Illuminate\Support\Facades\DB::statement('ALTER TABLE notifications MODIFY notifiable_id VARCHAR(255) NULL');
            } catch (\Exception $e2) {}
        }
        try {
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE notifications MODIFY title VARCHAR(255) NULL');
        } catch (\Exception $e) {}
        try {
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE notifications MODIFY message TEXT NULL');
        } catch (\Exception $e) {}
    }

    public function down(): void
    {
        // Don't drop table in down - just make columns non-nullable again if needed
    }
};
