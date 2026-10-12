<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void
{
Schema::create('offers', function (
Blueprint $table
): void {
$table->id();

$table->string('public_id', 30)
->unique();

$table->foreignId('wanted_ad_id')
->constrained('wanted_ads')
->cascadeOnDelete();

$table->foreignId('provider_id')
->constrained('users')
->cascadeOnDelete();

$table->decimal(
'proposed_price',
12,
2
);

$table->date('proposed_date');

$table->time('proposed_time');

$table->unsignedInteger(
'duration_minutes'
);

$table->text('message')
->nullable();

$table->text('terms')
->nullable();

$table->date('expires_on')
->nullable();

$table->enum('status', [
'submitted',
'accepted',
'declined',
'withdrawn',
])->default('submitted');

$table->text('customer_response')
->nullable();

$table->unsignedBigInteger('booking_id')
->nullable();

$table->timestamps();

$table->unique(
[
'wanted_ad_id',
'provider_id',
],
'offers_ad_provider_unique'
);

$table->index([
'provider_id',
'status',
]);

$table->index([
'wanted_ad_id',
'status',
]);
});
}

public function down(): void
{
Schema::dropIfExists('offers');
}
};