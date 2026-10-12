<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(
            'notifications',
            function (Blueprint $table): void {
                $table->id();

                $table->string(
                    'public_id',
                    30
                )->unique();

                $table->foreignId('user_id')
                    ->constrained('users')
                    ->cascadeOnDelete();

                $table->string(
                    'type',
                    50
                )->default('general');

                $table->string(
                    'title',
                    191
                );

                $table->text('message');

                $table->string(
                    'related_type',
                    50
                )->nullable();

                $table->string(
                    'related_public_id',
                    50
                )->nullable();

                $table->string(
                    'action_path',
                    500
                )->nullable();

                $table->timestamp(
                    'read_at'
                )->nullable();

                $table->timestamps();

                $table->index(
                    [
                        'user_id',
                        'read_at',
                    ],
                    'notifications_user_read_index'
                );

                $table->index(
                    [
                        'user_id',
                        'type',
                    ],
                    'notifications_user_type_index'
                );

                $table->index(
                    [
                        'related_type',
                        'related_public_id',
                    ],
                    'notifications_related_record_index'
                );
            }
        );
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'notifications'
        );
    }
};