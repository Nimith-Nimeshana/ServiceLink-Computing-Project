<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void
{
Schema::create('availability_slots', function (
Blueprint $table
): void {
$table->id();

$table->string('public_id', 20)->unique();

$table->foreignId('provider_id')
->constrained('users')
->cascadeOnDelete();

$table->date('slot_date');
$table->time('start_time');
$table->time('end_time');

$table->enum('status', [
'available',
'reserved',
'blocked',
])->default('available');

$table->unsignedBigInteger('booking_id')
->nullable();

$table->string('note', 500)
->nullable();

$table->timestamps();

$table->index([
'provider_id',
'slot_date',
]);

$table->index([
'provider_id',
'status',
]);
});
}

public function down(): void
{
Schema::dropIfExists('availability_slots');
}
};