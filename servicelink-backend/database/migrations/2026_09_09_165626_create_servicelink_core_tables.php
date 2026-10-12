<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Existing Users Table Update or Drop & Recreate
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('platform_settings');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('complaints');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('wanted_ads');
        Schema::dropIfExists('services');
        Schema::dropIfExists('qualifications');
        Schema::dropIfExists('provider_applications');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('users');

        // Users table
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('public_id', 30)->unique();
            $table->string('name', 150);
            $table->string('email', 191)->unique();
            $table->string('phone', 30)->nullable();
            $table->string('password', 255);
            $table->string('role', 30)->default('customer'); // customer, provider, administrator
            $table->string('status', 30)->default('active'); // active, pending, suspended
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Categories table
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('public_id', 30)->unique();
            $table->string('name', 100)->unique();
            $table->string('slug', 120)->unique();
            $table->text('description')->nullable();
            $table->string('status', 30)->default('active'); // active, inactive
            $table->unsignedInteger('sort_order')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Provider Applications table
        Schema::create('provider_applications', function (Blueprint $table) {
            $table->id();
            $table->string('public_id', 30)->unique();
            $table->foreignId('provider_id')->constrained('users')->cascadeOnDelete();
            $table->string('business_name', 150);
            $table->string('owner_name', 150);
            $table->string('categories_text', 255);
            $table->string('status', 30)->default('submitted'); // submitted, under_review, changes_requested, approved, rejected, suspended
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('review_started_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('decision_note')->nullable();
            $table->text('summary')->nullable();
            $table->timestamps();
        });

        // Qualifications table
        Schema::create('qualifications', function (Blueprint $table) {
            $table->id();
            $table->string('public_id', 30)->unique();
            $table->foreignId('provider_application_id')->constrained('provider_applications')->cascadeOnDelete();
            $table->foreignId('provider_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 191);
            $table->string('issuer', 191);
            $table->date('issued_on')->nullable();
            $table->date('expires_on')->nullable();
            $table->string('file_path', 255)->default('documents/demo.pdf');
            $table->string('original_filename', 255);
            $table->string('status', 30)->default('pending'); // pending, approved, replacement_requested, rejected
            $table->text('review_note')->nullable();
            $table->timestamps();
        });

        // Services table
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('public_id', 30)->unique();
            $table->foreignId('provider_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->string('title', 191);
            $table->string('slug', 220)->nullable();
            $table->text('description')->nullable();
            $table->string('price_display', 50)->default('From LKR 2,500');
            $table->decimal('price_min', 12, 2)->default(2500.00);
            $table->string('status', 30)->default('active'); // active, paused, inactive, hidden
            $table->integer('reports_count')->default(0);
            $table->timestamps();
        });

        // Wanted Ads table
        Schema::create('wanted_ads', function (Blueprint $table) {
            $table->id();
            $table->string('public_id', 30)->unique();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->string('title', 191);
            $table->text('description')->nullable();
            $table->string('district', 100)->default('Anuradhapura');
            $table->string('budget_display', 100)->default('LKR 8,000 - 12,000');
            $table->string('deadline_display', 50)->default('10 Sep 2026');
            $table->string('status', 30)->default('active'); // active, expired, hidden
            $table->integer('offers_count')->default(0);
            $table->integer('reports_count')->default(0);
            $table->timestamps();
        });

        // Bookings table
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('public_id', 30)->unique();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('provider_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 191);
            $table->string('source', 30)->default('Direct booking');
            $table->string('date_display', 50)->default('08 Sep 2026');
            $table->decimal('agreed_amount', 12, 2)->default(3500.00);
            $table->decimal('commission_rate', 5, 2)->default(10.00);
            $table->decimal('commission_amount', 12, 2)->default(350.00);
            $table->decimal('provider_net_amount', 12, 2)->default(3150.00);
            $table->string('status', 30)->default('accepted'); // pending, accepted, in_progress, completed, cancelled, disputed
            $table->timestamps();
        });

        // Reviews table
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->string('public_id', 30)->unique();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('provider_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('rating')->default(5);
            $table->text('comment');
            $table->string('status', 30)->default('published'); // published, reported, hidden
            $table->integer('reports_count')->default(0);
            $table->timestamps();
        });

        // Complaints table
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->string('public_id', 30)->unique();
            $table->foreignId('complainant_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('against_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('record_reference', 50)->default('BK-1031');
            $table->string('subject', 191);
            $table->text('description');
            $table->string('status', 30)->default('under_review'); // submitted, under_review, resolved, closed
            $table->text('resolution_note')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });

        // Transactions table (Revenue / Commission)
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('public_id', 30)->unique();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('provider_id')->constrained('users')->cascadeOnDelete();
            $table->string('source', 50)->default('Direct booking');
            $table->decimal('gross_amount', 12, 2);
            $table->decimal('commission_rate', 5, 2)->default(10.00);
            $table->decimal('commission_amount', 12, 2);
            $table->decimal('provider_net_amount', 12, 2);
            $table->string('status', 30)->default('pending'); // pending, recorded, cancelled, adjusted
            $table->timestamp('recorded_at')->nullable();
            $table->timestamps();
        });

        // Platform Settings table
        Schema::create('platform_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->text('value');
            $table->string('type', 30)->default('string');
            $table->string('description', 255)->nullable();
            $table->timestamps();
        });

        // Audit Logs table
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('public_id', 30)->unique();
            $table->string('actor', 100)->default('Admin User');
            $table->string('action', 150);
            $table->string('target', 100);
            $table->string('ip', 45)->default('127.0.0.1');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('platform_settings');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('complaints');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('wanted_ads');
        Schema::dropIfExists('services');
        Schema::dropIfExists('qualifications');
        Schema::dropIfExists('provider_applications');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('users');
    }
};