<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(
            'complaint_responses',
            function (Blueprint $table): void {
                $table->id();

                $table->string(
                    'public_id',
                    30
                )->unique();

                $table->foreignId('complaint_id')
                    ->constrained('complaints')
                    ->cascadeOnDelete();

                $table->foreignId('provider_id')
                    ->constrained('users')
                    ->cascadeOnDelete();

                $table->text('response_text');

                $table->string(
                    'status',
                    30
                )->default('submitted');

                $table->timestamp(
                    'submitted_at'
                )->nullable();

                $table->timestamp(
                    'last_edited_at'
                )->nullable();

                $table->timestamps();

                $table->unique(
                    'complaint_id',
                    'complaint_responses_complaint_unique'
                );

                $table->index(
                    [
                        'provider_id',
                        'status',
                    ],
                    'complaint_responses_provider_status_index'
                );
            }
        );
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'complaint_responses'
        );
    }
};