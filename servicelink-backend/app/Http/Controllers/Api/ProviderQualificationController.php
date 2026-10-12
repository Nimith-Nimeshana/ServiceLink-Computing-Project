<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProviderQualificationRequest;
use App\Http\Requests\UpdateProviderQualificationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class ProviderQualificationController extends Controller
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

private function findProvider(string $providerPublicId): ?object
{
return DB::table('users')
->where('public_id', $providerPublicId)
->where('role', 'provider')
->first();
}

private function findApplication(int $providerId): ?object
{
return DB::table('provider_applications')
->where('provider_id', $providerId)
->first();
}

private function createPublicId(): string
{
do {
$publicId = 'QL-' . strtoupper(Str::random(10));
} while (
DB::table('qualifications')
->where('public_id', $publicId)
->exists()
);

return $publicId;
}

private function qualificationResponse(
string $qualificationPublicId,
int $providerId
): ?object {
return DB::table('qualifications')
->where('public_id', $qualificationPublicId)
->where('provider_id', $providerId)
->select([
'id',
'public_id',
'provider_application_id',
'provider_id',
'title',
'issuer',
'issued_on',
'expires_on',
'original_filename',
'status',
'review_note',
'created_at',
'updated_at',
])
->first();
}

public function store(
StoreProviderQualificationRequest $request,
string $providerPublicId
): JsonResponse {
$provider = $this->findProvider($providerPublicId);

if (!$provider) {
return $this->jsonResponse(
false,
'Provider account not found.',
null,
null,
404
);
}

$application = $this->findApplication($provider->id);

if (!$application) {
return $this->jsonResponse(
false,
'Provider application not found.',
null,
null,
404
);
}

if (in_array(
$application->status,
['approved', 'rejected', 'suspended'],
true
)) {
return $this->jsonResponse(
false,
'A qualification cannot be added in the current application state.',
null,
null,
409
);
}

$document = $request->file('document');
$storedPath = null;
$publicId = $this->createPublicId();

try {
$storedPath = $document->store(
'provider-qualifications/' . $provider->id,
'local'
);

DB::transaction(function () use (
$request,
$provider,
$application,
$document,
$storedPath,
$publicId
): void {
DB::table('qualifications')->insert([
'public_id' => $publicId,
'provider_application_id' => $application->id,
'provider_id' => $provider->id,
'title' => $request->validated('title'),
'issuer' => $request->validated('issuer'),
'issued_on' => $request->validated('issued_on'),
'expires_on' => $request->validated('expires_on'),
'file_path' => $storedPath,
'original_filename' =>
$document->getClientOriginalName(),
'status' => 'pending',
'review_note' => null,
'created_at' => now(),
'updated_at' => now(),
]);
});
} catch (Throwable $exception) {
if (
$storedPath !== null
&& Storage::disk('local')->exists($storedPath)
) {
Storage::disk('local')->delete($storedPath);
}

report($exception);

return $this->jsonResponse(
false,
'The qualification could not be created.',
null,
null,
500
);
}

$qualification = $this->qualificationResponse(
$publicId,
$provider->id
);

return $this->jsonResponse(
true,
'Qualification created successfully.',
$qualification,
null,
201
);
}

public function update(
UpdateProviderQualificationRequest $request,
string $providerPublicId,
string $qualificationPublicId
): JsonResponse {
$provider = $this->findProvider($providerPublicId);

if (!$provider) {
return $this->jsonResponse(
false,
'Provider account not found.',
null,
null,
404
);
}

$application = $this->findApplication($provider->id);

if (!$application) {
return $this->jsonResponse(
false,
'Provider application not found.',
null,
null,
404
);
}

$qualification = DB::table('qualifications')
->where('public_id', $qualificationPublicId)
->where('provider_id', $provider->id)
->where(
'provider_application_id',
$application->id
)
->first();

if (!$qualification) {
return $this->jsonResponse(
false,
'Qualification not found.',
null,
null,
404
);
}

if (in_array(
$application->status,
['approved', 'rejected', 'suspended'],
true
)) {
return $this->jsonResponse(
false,
'The qualification cannot be changed in the current application state.',
null,
null,
409
);
}

$validated = $request->validated();
$newDocument = $request->file('document');
$newStoredPath = null;
$oldStoredPath = $qualification->file_path;

try {
if ($newDocument !== null) {
$newStoredPath = $newDocument->store(
'provider-qualifications/' . $provider->id,
'local'
);
}

DB::transaction(function () use (
$validated,
$newDocument,
$newStoredPath,
$qualification
): void {
$updates = [];

foreach (
[
'title',
'issuer',
'issued_on',
'expires_on',
] as $field
) {
if (array_key_exists($field, $validated)) {
$updates[$field] = $validated[$field];
}
}

if ($newDocument !== null) {
$updates['file_path'] = $newStoredPath;
$updates['original_filename'] =
$newDocument->getClientOriginalName();
}

$updates['status'] = 'pending';
$updates['review_note'] = null;
$updates['updated_at'] = now();

DB::table('qualifications')
->where('id', $qualification->id)
->update($updates);
});
} catch (Throwable $exception) {
if (
$newStoredPath !== null
&& Storage::disk('local')->exists($newStoredPath)
) {
Storage::disk('local')->delete($newStoredPath);
}

report($exception);

return $this->jsonResponse(
false,
'The qualification could not be updated.',
null,
null,
500
);
}

if (
$newDocument !== null
&& $oldStoredPath !== null
&& $oldStoredPath !== 'documents/demo.pdf'
&& Storage::disk('local')->exists($oldStoredPath)
) {
Storage::disk('local')->delete($oldStoredPath);
}

$updatedQualification = $this->qualificationResponse(
$qualificationPublicId,
$provider->id
);

return $this->jsonResponse(
true,
'Qualification updated successfully.',
$updatedQualification
);
}
public function preview(
string $providerPublicId,
string $qualificationPublicId
) {
$provider = $this->findProvider($providerPublicId);

if (!$provider) {
return $this->jsonResponse(
false,
'Provider account not found.',
null,
null,
404
);
}

$application = $this->findApplication($provider->id);

if (!$application) {
return $this->jsonResponse(
false,
'Provider application not found.',
null,
null,
404
);
}

$qualification = DB::table('qualifications')
->where('public_id', $qualificationPublicId)
->where('provider_id', $provider->id)
->where(
'provider_application_id',
$application->id
)
->first();

if (!$qualification) {
return $this->jsonResponse(
false,
'Qualification not found.',
null,
null,
404
);
}

if (
empty($qualification->file_path)
|| !Storage::disk('local')->exists(
$qualification->file_path
)
) {
return $this->jsonResponse(
false,
'Qualification document not found.',
null,
null,
404
);
}

$absolutePath = Storage::disk('local')->path(
$qualification->file_path
);

return response()->file(
$absolutePath,
[
'Content-Disposition' =>
'inline; filename="' .
basename($qualification->original_filename) .
'"',
'X-Content-Type-Options' => 'nosniff',
'Cache-Control' =>
'private, no-store, no-cache, must-revalidate',
]
);
}

public function download(
string $providerPublicId,
string $qualificationPublicId
) {
$provider = DB::table('users')
->where('public_id', $providerPublicId)
->where('role', 'provider')
->first();

if (!$provider) {
return $this->jsonResponse(
false,
'Provider account not found.',
null,
null,
404
);
}

$application = DB::table('provider_applications')
->where('provider_id', $provider->id)
->first();

if (!$application) {
return $this->jsonResponse(
false,
'Provider application not found.',
null,
null,
404
);
}

$qualification = DB::table('qualifications')
->where('public_id', $qualificationPublicId)
->where('provider_id', $provider->id)
->where(
'provider_application_id',
$application->id
)
->first();

if (!$qualification) {
return $this->jsonResponse(
false,
'Qualification not found.',
null,
null,
404
);
}

if (
empty($qualification->file_path)
|| !Storage::disk('local')->exists(
$qualification->file_path
)
) {
return $this->jsonResponse(
false,
'Qualification document not found.',
null,
null,
404
);
}

return Storage::disk('local')->download(
$qualification->file_path,
basename($qualification->original_filename),
[
'X-Content-Type-Options' => 'nosniff',
'Cache-Control' =>
'private, no-store, no-cache, must-revalidate',
]
);
}
public function destroy(
string $providerPublicId,
string $qualificationPublicId
): JsonResponse {
$provider = $this->findProvider($providerPublicId);

if (!$provider) {
return $this->jsonResponse(
false,
'Provider account not found.',
null,
null,
404
);
}

$application = $this->findApplication($provider->id);

if (!$application) {
return $this->jsonResponse(
false,
'Provider application not found.',
null,
null,
404
);
}

$qualification = DB::table('qualifications')
->where('public_id', $qualificationPublicId)
->where('provider_id', $provider->id)
->where(
'provider_application_id',
$application->id
)
->first();

if (!$qualification) {
return $this->jsonResponse(
false,
'Qualification not found.',
null,
null,
404
);
}

if (
in_array(
$application->status,
[
'approved',
'rejected',
'suspended',
],
true
)
) {
return $this->jsonResponse(
false,
'The qualification cannot be deleted in the current application state.',
null,
null,
409
);
}

$storedPath = $qualification->file_path;

try {
DB::transaction(function () use (
$qualification
): void {
DB::table('qualifications')
->where('id', $qualification->id)
->delete();
});
} catch (Throwable $exception) {
report($exception);

return $this->jsonResponse(
false,
'The qualification could not be deleted.',
null,
null,
500
);
}

if (
!empty($storedPath)
&& $storedPath !== 'documents/demo.pdf'
&& Storage::disk('local')->exists($storedPath)
) {
Storage::disk('local')->delete($storedPath);
}

return $this->jsonResponse(
true,
'Qualification deleted successfully.',
[
'public_id' => $qualificationPublicId,
]
);
}
}