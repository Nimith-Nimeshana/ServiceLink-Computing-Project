<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (
            Blueprint $table
        ): void {
            $table->foreignId('service_id')
                ->nullable()
                ->after('provider_id')
                ->constrained('services')
                ->nullOnDelete();

            $table->foreignId('offer_id')
                ->nullable()
                ->after('service_id')
                ->constrained('offers')
                ->nullOnDelete();

            $table->date('scheduled_date')
                ->nullable()
                ->after('source');

            $table->time('scheduled_time')
                ->nullable()
                ->after('scheduled_date');

            $table->unsignedInteger('duration_minutes')
                ->nullable()
                ->after('scheduled_time');

            $table->text('task_description')
                ->nullable()
                ->after('duration_minutes');

            $table->string('district', 100)
                ->nullable()
                ->after('task_description');

            $table->string('address', 500)
                ->nullable()
                ->after('district');

            $table->text('customer_note')
                ->nullable()
                ->after('address');

            $table->text('provider_note')
                ->nullable()
                ->after('customer_note');

            $table->timestamp('accepted_at')
                ->nullable()
                ->after('status');

            $table->timestamp('rejected_at')
                ->nullable()
                ->after('accepted_at');

            $table->timestamp('started_at')
                ->nullable()
                ->after('rejected_at');

            $table->timestamp('completed_at')
                ->nullable()
                ->after('started_at');

            $table->index([
                'provider_id',
                'status',
            ]);

            $table->index([
                'provider_id',
                'scheduled_date',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (
            Blueprint $table
        ): void {
            $table->dropForeign([
                'service_id',
            ]);

            $table->dropForeign([
                'offer_id',
            ]);

            $table->dropIndex([
                'provider_id',
                'status',
            ]);

            $table->dropIndex([
                'provider_id',
                'scheduled_date',
            ]);

            $table->dropColumn([
                'service_id',
                'offer_id',
                'scheduled_date',
                'scheduled_time',
                'duration_minutes',
                'task_description',
                'district',
                'address',
                'customer_note',
                'provider_note',
                'accepted_at',
                'rejected_at',
                'started_at',
                'completed_at',
            ]);
        });
    }
};