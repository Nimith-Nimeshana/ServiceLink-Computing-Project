<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProviderServiceRequest;
use App\Http\Requests\UpdateProviderServiceRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class ProviderServiceController extends Controller
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
'SV-' . strtoupper(Str::random(10));
} while (
DB::table('services')
->where('public_id', $publicId)
->exists()
);

return $publicId;
}

private function createUniqueSlug(
string $title,
?int $ignoreServiceId = null
): string {
$baseSlug = Str::slug($title);

if ($baseSlug === '') {
$baseSlug = 'provider-service';
}

$slug = $baseSlug;
$counter = 2;

while (
DB::table('services')
->when(
$ignoreServiceId !== null,
fn ($query) => $query->where(
'id',
'!=',
$ignoreServiceId
)
)
->where('slug', $slug)
->exists()
) {
$slug = $baseSlug . '-' . $counter;
$counter++;
}

return $slug;
}

private function formatPrice(
float|int|string $price
): string {
return 'From LKR ' .
number_format((float) $price, 0);
}

private function serviceResponse(
string $servicePublicId,
int $providerId
): ?object {
return DB::table('services')
->join(
'categories',
'services.category_id',
'=',
'categories.id'
)
->where(
'services.public_id',
$servicePublicId
)
->where(
'services.provider_id',
$providerId
)
->select([
'services.id',
'services.public_id',
'services.provider_id',
'services.category_id',
'categories.public_id as category_public_id',
'categories.name as category_name',
'services.title',
'services.slug',
'services.description',
'services.price_display',
'services.price_min',
'services.status',
'services.reports_count',
'services.created_at',
'services.updated_at',
])
->first();
}

public function categories(): JsonResponse
{
$categories = DB::table('categories')
->where('status', 'active')
->select([
'id',
'public_id',
'name',
'slug',
'description',
])
->orderBy('sort_order')
->orderBy('name')
->get();

return $this->jsonResponse(
true,
'Service categories retrieved successfully.',
[
'items' => $categories,
'total' => $categories->count(),
]
);
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

$services = DB::table('services')
->join(
'categories',
'services.category_id',
'=',
'categories.id'
)
->where(
'services.provider_id',
$provider->id
)
->select([
'services.id',
'services.public_id',
'services.provider_id',
'services.category_id',
'categories.public_id as category_public_id',
'categories.name as category_name',
'services.title',
'services.slug',
'services.description',
'services.price_display',
'services.price_min',
'services.status',
'services.reports_count',
'services.created_at',
'services.updated_at',
])
->orderByDesc('services.created_at')
->get();

return $this->jsonResponse(
true,
'Provider services retrieved successfully.',
[
'provider_public_id' =>
$provider->public_id,
'items' => $services,
'total' => $services->count(),
]
);
}

public function show(
string $providerPublicId,
string $servicePublicId
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

$service = $this->serviceResponse(
$servicePublicId,
$provider->id
);

if (!$service) {
return $this->jsonResponse(
false,
'Service not found.',
null,
null,
404
);
}

return $this->jsonResponse(
true,
'Provider service retrieved successfully.',
$service
);
}

public function store(
StoreProviderServiceRequest $request,
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
$publicId = $this->createPublicId();
$slug = $this->createUniqueSlug(
$validated['title']
);

try {
DB::transaction(function () use (
$validated,
$provider,
$publicId,
$slug
): void {
DB::table('services')->insert([
'public_id' => $publicId,
'provider_id' => $provider->id,
'category_id' =>
$validated['category_id'],
'title' => $validated['title'],
'slug' => $slug,
'description' =>
$validated['description'] ?? null,
'price_display' =>
$this->formatPrice(
$validated['price_min']
),
'price_min' =>
$validated['price_min'],
'status' => $validated['status'],
'reports_count' => 0,
'created_at' => now(),
'updated_at' => now(),
]);
});
} catch (Throwable $exception) {
report($exception);

return $this->jsonResponse(
false,
'The service could not be created.',
null,
null,
500
);
}

return $this->jsonResponse(
true,
'Service created successfully.',
$this->serviceResponse(
$publicId,
$provider->id
),
null,
201
);
}

public function update(
UpdateProviderServiceRequest $request,
string $providerPublicId,
string $servicePublicId
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

$service = DB::table('services')
->where('public_id', $servicePublicId)
->where('provider_id', $provider->id)
->first();

if (!$service) {
return $this->jsonResponse(
false,
'Service not found.',
null,
null,
404
);
}

$validated = $request->validated();
$updates = [];

foreach (
[
'category_id',
'title',
'description',
'price_min',
'status',
] as $field
) {
if (array_key_exists($field, $validated)) {
$updates[$field] = $validated[$field];
}
}

if (array_key_exists('title', $validated)) {
$updates['slug'] =
$this->createUniqueSlug(
$validated['title'],
$service->id
);
}

if (array_key_exists('price_min', $validated)) {
$updates['price_display'] =
$this->formatPrice(
$validated['price_min']
);
}

$updates['updated_at'] = now();

try {
DB::table('services')
->where('id', $service->id)
->update($updates);
} catch (Throwable $exception) {
report($exception);

return $this->jsonResponse(
false,
'The service could not be updated.',
null,
null,
500
);
}

return $this->jsonResponse(
true,
'Service updated successfully.',
$this->serviceResponse(
$servicePublicId,
$provider->id
)
);
}

public function toggleStatus(
string $providerPublicId,
string $servicePublicId
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

$service = DB::table('services')
->where('public_id', $servicePublicId)
->where('provider_id', $provider->id)
->first();

if (!$service) {
return $this->jsonResponse(
false,
'Service not found.',
null,
null,
404
);
}

$newStatus =
$service->status === 'active'
? 'paused'
: 'active';

DB::table('services')
->where('id', $service->id)
->update([
'status' => $newStatus,
'updated_at' => now(),
]);

return $this->jsonResponse(
true,
"Service status updated to {$newStatus}.",
$this->serviceResponse(
$servicePublicId,
$provider->id
)
);
}
}