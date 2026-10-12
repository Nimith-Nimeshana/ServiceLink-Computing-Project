<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProviderProfileRequest;
use App\Models\ProviderProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProviderController extends Controller
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

public function profile(string $publicId): JsonResponse
{
$profile = ProviderProfile::query()
->join(
'users',
'provider_profiles.user_id',
'=',
'users.id'
)
->where('users.public_id', $publicId)
->where('users.role', 'provider')
->select([
'provider_profiles.id',
'provider_profiles.user_id',
'users.public_id as user_public_id',
'users.name as account_name',
'users.email as account_email',
'users.status as account_status',
'provider_profiles.business_name',
'provider_profiles.professional_title',
'provider_profiles.professional_summary',
'provider_profiles.primary_district',
'provider_profiles.coverage_area',
'provider_profiles.years_experience',
'provider_profiles.public_email',
'provider_profiles.public_phone',
'provider_profiles.average_rating',
'provider_profiles.review_count',
'provider_profiles.created_at',
'provider_profiles.updated_at',
])
->first();

if (!$profile) {
return $this->jsonResponse(
false,
'Provider profile not found.',
null,
null,
404
);
}

return $this->jsonResponse(
true,
'Provider profile retrieved successfully.',
$profile
);
}

public function updateProfile(
UpdateProviderProfileRequest $request,
string $publicId
): JsonResponse {
$profile = ProviderProfile::query()
->join(
'users',
'provider_profiles.user_id',
'=',
'users.id'
)
->where('users.public_id', $publicId)
->where('users.role', 'provider')
->select('provider_profiles.*')
->first();

if (!$profile) {
return $this->jsonResponse(
false,
'Provider profile not found.',
null,
null,
404
);
}

$profile->update($request->validated());

$updatedProfile = ProviderProfile::query()
->join(
'users',
'provider_profiles.user_id',
'=',
'users.id'
)
->where('provider_profiles.id', $profile->id)
->select([
'provider_profiles.id',
'provider_profiles.user_id',
'users.public_id as user_public_id',
'users.name as account_name',
'users.email as account_email',
'users.status as account_status',
'provider_profiles.business_name',
'provider_profiles.professional_title',
'provider_profiles.professional_summary',
'provider_profiles.primary_district',
'provider_profiles.coverage_area',
'provider_profiles.years_experience',
'provider_profiles.public_email',
'provider_profiles.public_phone',
'provider_profiles.average_rating',
'provider_profiles.review_count',
'provider_profiles.created_at',
'provider_profiles.updated_at',
])
->first();

return $this->jsonResponse(
true,
'Provider profile updated successfully.',
$updatedProfile
);
}

public function application(string $publicId): JsonResponse
{
$provider = DB::table('users')
->where('public_id', $publicId)
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

$profile = DB::table('provider_profiles')
->where('user_id', $provider->id)
->first();

$qualificationCount = DB::table('qualifications')
->where('provider_id', $provider->id)
->where(
'provider_application_id',
$application->id
)
->count();

$profileComplete = $profile !== null
&& !empty($profile->business_name)
&& !empty($profile->professional_title)
&& !empty($profile->professional_summary)
&& !empty($profile->primary_district)
&& !empty($profile->coverage_area)
&& $profile->years_experience !== null;

$qualificationsComplete = $qualificationCount > 0;

$submissionComplete = in_array(
$application->status,
[
'submitted',
'pending',
'under_review',
'under review',
'changes_requested',
'changes requested',
'approved',
'rejected',
'suspended',
],
true
);

$completedSteps = collect([
true,
$profileComplete,
$qualificationsComplete,
$submissionComplete,
])->filter()->count();

$completionPercentage = (int) round(
($completedSteps / 4) * 100
);

return $this->jsonResponse(
true,
'Provider application retrieved successfully.',
[
'provider' => [
'id' => $provider->id,
'public_id' => $provider->public_id,
'name' => $provider->name,
'email' => $provider->email,
'phone' => $provider->phone,
'role' => $provider->role,
'account_status' => $provider->status,
],
'application' => [
'id' => $application->id,
'public_id' => $application->public_id,
'business_name' => $application->business_name,
'owner_name' => $application->owner_name,
'categories_text' => $application->categories_text,
'status' => $application->status,
'summary' => $application->summary,
'submitted_at' => $application->submitted_at,
'review_started_at' => $application->review_started_at,
'reviewed_at' => $application->reviewed_at,
'decision_note' => $application->decision_note,
'created_at' => $application->created_at,
'updated_at' => $application->updated_at,
],
'profile' => $profile,
'qualification_count' => $qualificationCount,
'completion' => [
'account_complete' => true,
'profile_complete' => $profileComplete,
'qualifications_complete' =>
$qualificationsComplete,
'submission_complete' => $submissionComplete,
'completed_steps' => $completedSteps,
'total_steps' => 4,
'percentage' => $completionPercentage,
],
]
);
}

public function qualifications(string $publicId): JsonResponse
{
$provider = DB::table('users')
->where('public_id', $publicId)
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

$qualifications = DB::table('qualifications')
->where('provider_id', $provider->id)
->where(
'provider_application_id',
$application->id
)
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
->orderByDesc('created_at')
->get();

return $this->jsonResponse(
true,
'Provider qualifications retrieved successfully.',
[
'application_public_id' => $application->public_id,
'provider_public_id' => $provider->public_id,
'items' => $qualifications,
'total' => $qualifications->count(),
]
);
}
}