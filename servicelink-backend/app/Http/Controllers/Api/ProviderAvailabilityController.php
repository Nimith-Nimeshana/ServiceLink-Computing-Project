<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProviderAvailabilityRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class ProviderAvailabilityController extends Controller
{
private function jsonResponse(
bool $success,
string $message,
mixed $data = null,
mixed $errors = null,
int $status = 200
): JsonResponse {
return response()->json([
'success' => $success,
'message' => $message,
'data' => $data,
'errors' => $errors,
], $status);
}

private function findProvider(
string $providerPublicId
): ?object {
return DB::table('users')
->where('public_id', $providerPublicId)
->where('role', 'provider')
->first();
}

private function createPublicId(): string
{
do {
$publicId =
'SL-' . strtoupper(Str::random(10));
} while (
DB::table('availability_slots')
->where('public_id', $publicId)
->exists()
);

return $publicId;
}

private function slotResponse(
string $slotPublicId,
int $providerId
): ?object {
return DB::table('availability_slots')
->where('public_id', $slotPublicId)
->where('provider_id', $providerId)
->select([
'id',
'public_id',
'provider_id',
'slot_date',
'start_time',
'end_time',
'status',
'booking_id',
'note',
'created_at',
'updated_at',
])
->first();
}

public function index(
string $providerPublicId
): JsonResponse {
$provider = $this->findProvider(
$providerPublicId
);

if (!$provider) {
return $this->jsonResponse(
false,
'Provider account not found.',
null,
null,
404
);
}

$slots = DB::table('availability_slots')
->where('provider_id', $provider->id)
->select([
'id',
'public_id',
'provider_id',
'slot_date',
'start_time',
'end_time',
'status',
'booking_id',
'note',
'created_at',
'updated_at',
])
->orderBy('slot_date')
->orderBy('start_time')
->get();

return $this->jsonResponse(
true,
'Provider availability retrieved successfully.',
[
'provider_public_id' =>
$provider->public_id,
'items' => $slots,
'total' => $slots->count(),
]
);
}

public function store(
StoreProviderAvailabilityRequest $request,
string $providerPublicId
): JsonResponse {
$provider = $this->findProvider(
$providerPublicId
);

if (!$provider) {
return $this->jsonResponse(
false,
'Provider account not found.',
null,
null,
404
);
}

$validated = $request->validated();

$overlappingSlot = DB::table(
'availability_slots'
)
->where('provider_id', $provider->id)
->where(
'slot_date',
$validated['slot_date']
)
->where(
'start_time',
'<',
$validated['end_time']
)
->where(
'end_time',
'>',
$validated['start_time']
)
->first();

if ($overlappingSlot) {
return $this->jsonResponse(
false,
'The availability period overlaps an existing slot.',
null,
[
'time' => [
'Choose a time period that does not overlap an existing availability slot.',
],
],
422
);
}

$publicId = $this->createPublicId();

try {
DB::table('availability_slots')->insert([
'public_id' => $publicId,
'provider_id' => $provider->id,
'slot_date' =>
$validated['slot_date'],
'start_time' =>
$validated['start_time'],
'end_time' =>
$validated['end_time'],
'status' =>
$validated['status'] ??
'available',
'booking_id' => null,
'note' =>
$validated['note'] ?? null,
'created_at' => now(),
'updated_at' => now(),
]);
} catch (Throwable $exception) {
report($exception);

return $this->jsonResponse(
false,
'The availability slot could not be created.',
null,
null,
500
);
}

return $this->jsonResponse(
true,
'Availability slot created successfully.',
$this->slotResponse(
$publicId,
$provider->id
),
null,
201
);
}

public function destroy(
string $providerPublicId,
string $slotPublicId
): JsonResponse {
$provider = $this->findProvider(
$providerPublicId
);

if (!$provider) {
return $this->jsonResponse(
false,
'Provider account not found.',
null,
null,
404
);
}

$slot = DB::table('availability_slots')
->where('public_id', $slotPublicId)
->where('provider_id', $provider->id)
->first();

if (!$slot) {
return $this->jsonResponse(
false,
'Availability slot not found.',
null,
null,
404
);
}

if (
$slot->status === 'reserved'
|| $slot->booking_id !== null
) {
return $this->jsonResponse(
false,
'A reserved availability slot cannot be deleted.',
[
'public_id' => $slot->public_id,
'status' => $slot->status,
],
null,
409
);
}

if ($slot->status !== 'available') {
return $this->jsonResponse(
false,
'Only available slots can be deleted.',
[
'public_id' => $slot->public_id,
'status' => $slot->status,
],
null,
409
);
}

try {
DB::table('availability_slots')
->where('id', $slot->id)
->delete();
} catch (Throwable $exception) {
report($exception);

return $this->jsonResponse(
false,
'The availability slot could not be deleted.',
null,
null,
500
);
}

return $this->jsonResponse(
true,
'Availability slot deleted successfully.',
[
'public_id' => $slotPublicId,
]
);
}
}