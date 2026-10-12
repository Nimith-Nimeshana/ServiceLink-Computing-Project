<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubmitProviderApplicationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

class ProviderApplicationController extends Controller
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

public function submit(
SubmitProviderApplicationRequest $request,
string $providerPublicId
): JsonResponse {
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

$normalizedStatus = str_replace(
' ',
'_',
strtolower($application->status)
);

$editableStatuses = [
'draft',
'incomplete',
'changes_requested',
];

if (!in_array(
$normalizedStatus,
$editableStatuses,
true
)) {
return $this->jsonResponse(
false,
'The application cannot be submitted in its current state.',
[
'application_public_id' =>
$application->public_id,
'current_status' =>
$application->status,
],
null,
409
);
}

$profile = DB::table('provider_profiles')
->where('user_id', $provider->id)
->first();

$profileErrors = [];

if (!$profile) {
$profileErrors[] =
'The professional provider profile is missing.';
} else {
if (empty($profile->business_name)) {
$profileErrors[] =
'The business or provider display name is required.';
}

if (empty($profile->professional_title)) {
$profileErrors[] =
'The professional title is required.';
}

if (empty($profile->professional_summary)) {
$profileErrors[] =
'The professional summary is required.';
}

if (empty($profile->primary_district)) {
$profileErrors[] =
'The primary operating district is required.';
}

if (empty($profile->coverage_area)) {
$profileErrors[] =
'The service coverage area is required.';
}

if (
$profile->years_experience === null
|| $profile->years_experience < 0
) {
$profileErrors[] =
'A valid years of experience value is required.';
}
}

if (!empty($profileErrors)) {
return $this->jsonResponse(
false,
'Complete the professional profile before submission.',
null,
[
'profile' => $profileErrors,
],
422
);
}

$qualificationCount = DB::table('qualifications')
->where('provider_id', $provider->id)
->where(
'provider_application_id',
$application->id
)
->count();

if ($qualificationCount < 1) {
return $this->jsonResponse(
false,
'Add at least one qualification before submission.',
null,
[
'qualifications' => [
'At least one qualification document is required.',
],
],
422
);
}

try {
DB::transaction(function () use (
$provider,
$application,
$profile
): void {
DB::table('provider_applications')
->where('id', $application->id)
->update([
'business_name' =>
$profile->business_name,
'summary' =>
$profile->professional_summary,
'status' => 'pending',
'submitted_at' => now(),
'review_started_at' => null,
'reviewed_at' => null,
'reviewed_by' => null,
'decision_note' => null,
'updated_at' => now(),
]);

if ($provider->status !== 'active') {
DB::table('users')
->where('id', $provider->id)
->update([
'status' => 'pending',
'updated_at' => now(),
]);
}
});
} catch (Throwable $exception) {
report($exception);

return $this->jsonResponse(
false,
'The provider application could not be submitted.',
null,
null,
500
);
}

$updatedApplication =
DB::table('provider_applications')
->where('id', $application->id)
->select([
'id',
'public_id',
'provider_id',
'business_name',
'owner_name',
'categories_text',
'status',
'submitted_at',
'review_started_at',
'reviewed_at',
'decision_note',
'summary',
'created_at',
'updated_at',
])
->first();

return $this->jsonResponse(
true,
'Provider application submitted successfully.',
[
'application' => $updatedApplication,
'qualification_count' =>
$qualificationCount,
'declaration_accepted' =>
$request->boolean(
'declaration_accepted'
),
]
);
}
}