<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
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

    private function generateUserPublicId(): string
    {
        do {
            $publicId = 'US-' . strtoupper(
                Str::random(10)
            );
        } while (
            DB::table('users')
                ->where('public_id', $publicId)
                ->exists()
        );

        return $publicId;
    }

    private function generateApplicationPublicId(): string
    {
        do {
            $publicId = 'PA-' . strtoupper(
                Str::random(10)
            );
        } while (
            DB::table('provider_applications')
                ->where('public_id', $publicId)
                ->exists()
        );

        return $publicId;
    }

    private function userPayload(
        User $user
    ): array {
        $application = null;

        if ($user->role === 'provider') {
            $application = DB::table(
                'provider_applications'
            )
                ->where(
                    'provider_id',
                    $user->id
                )
                ->orderByDesc('id')
                ->first();
        }

        return [
            'id' => $user->id,
            'public_id' => $user->public_id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'status' => $user->status,

            'application' => $application
                ? [
                    'public_id' =>
                        $application->public_id,

                    'status' =>
                        $application->status,

                    'business_name' =>
                        $application->business_name,

                    'categories_text' =>
                        $application->categories_text,

                    'submitted_at' =>
                        $application->submitted_at,

                    'decision_note' =>
                        $application->decision_note,
                ]
                : null,

            'is_approved_provider' =>
                $user->role === 'provider'
                && $user->status === 'active'
                && $application !== null
                && $application->status === 'approved',
        ];
    }

    private function destinationFor(
        User $user
    ): string {
        if ($user->role === 'administrator') {
            return '/admin/dashboard';
        }

        if ($user->role === 'customer') {
            return '/customer/dashboard';
        }

        if ($user->role !== 'provider') {
            return '/';
        }

        $application = DB::table(
            'provider_applications'
        )
            ->where(
                'provider_id',
                $user->id
            )
            ->orderByDesc('id')
            ->first();

        if (!$application) {
            return '/provider/application';
        }

        if (
            $application->status === 'approved'
            && $user->status === 'active'
        ) {
            return '/provider/dashboard';
        }

        if (
            in_array(
                $application->status,
                [
                    'pending',
                    'submitted',
                    'under review',
                ],
                true
            )
        ) {
            return '/provider/application/status';
        }

        if (
            in_array(
                $application->status,
                [
                    'changes requested',
                    'rejected',
                    'draft',
                ],
                true
            )
        ) {
            return '/provider/application';
        }

        return '/provider/application/status';
    }

    public function registerProvider(
        Request $request
    ): JsonResponse {
        $validator = Validator::make(
            $request->all(),
            [
                'name' => [
                    'required',
                    'string',
                    'max:150',
                ],

                'business_name' => [
                    'required',
                    'string',
                    'max:150',
                ],

                'email' => [
                    'required',
                    'email',
                    'max:191',
                    'unique:users,email',
                ],

                'phone' => [
                    'nullable',
                    'string',
                    'max:30',
                ],

                'password' => [
                    'required',
                    'confirmed',
                    Password::min(8)
                        ->letters()
                        ->numbers(),
                ],

                'categories_text' => [
                    'nullable',
                    'string',
                    'max:255',
                ],
            ]
        );

        if ($validator->fails()) {
            return $this->jsonResponse(
                false,
                'Provider registration validation failed.',
                null,
                $validator->errors(),
                422
            );
        }

        $validated = $validator->validated();

        try {
            $result = DB::transaction(
                function () use (
                    $validated
                ): array {
                    $user = User::create([
                        'public_id' =>
                            $this
                                ->generateUserPublicId(),

                        'name' =>
                            $validated['name'],

                        'email' =>
                            strtolower(
                                $validated['email']
                            ),

                        'phone' =>
                            $validated['phone']
                            ?? null,

                        'password' =>
                            $validated['password'],

                        'role' => 'provider',
                        'status' => 'pending',
                    ]);

                    DB::table(
                        'provider_applications'
                    )->insert([
                        'public_id' =>
                            $this
                                ->generateApplicationPublicId(),

                        'provider_id' =>
                            $user->id,

                        'business_name' =>
                            $validated[
                                'business_name'
                            ],

                        'owner_name' =>
                            $validated['name'],

                        'categories_text' =>
                            $validated[
                                'categories_text'
                            ]
                            ?? 'Not selected',

                        'status' => 'draft',
                        'submitted_at' => null,
                        'review_started_at' => null,
                        'reviewed_at' => null,
                        'reviewed_by' => null,
                        'decision_note' => null,
                        'summary' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $token = $user
                        ->createToken(
                            'servicelink-web',
                            ['provider']
                        )
                        ->plainTextToken;

                    return [
                        'user' =>
                            $this->userPayload(
                                $user
                            ),

                        'token' => $token,

                        'token_type' =>
                            'Bearer',

                        'destination' =>
                            '/provider/application',
                    ];
                }
            );

            return $this->jsonResponse(
                true,
                'Provider account created successfully.',
                $result,
                null,
                201
            );
        } catch (\Throwable $exception) {
            report($exception);

            return $this->jsonResponse(
                false,
                'The provider account could not be created.',
                null,
                null,
                500
            );
        }
    }

    public function login(
        Request $request
    ): JsonResponse {
        $validator = Validator::make(
            $request->all(),
            [
                'email' => [
                    'required',
                    'email',
                ],

                'password' => [
                    'required',
                    'string',
                ],

                'remember' => [
                    'sometimes',
                    'boolean',
                ],
            ]
        );

        if ($validator->fails()) {
            return $this->jsonResponse(
                false,
                'Login validation failed.',
                null,
                $validator->errors(),
                422
            );
        }

        $email = strtolower(
            $request->string('email')
                ->toString()
        );

        $password = $request
            ->string('password')
            ->toString();

        $user = User::where(
            'email',
            $email
        )->first();

        if (
            !$user
            || !Hash::check(
                $password,
                $user->password
            )
        ) {
            return $this->jsonResponse(
                false,
                'The email address or password is incorrect.',
                null,
                null,
                401
            );
        }

        if (
            in_array(
                $user->status,
                [
                    'suspended',
                    'inactive',
                    'blocked',
                ],
                true
            )
        ) {
            return $this->jsonResponse(
                false,
                'This account is currently restricted.',
                [
                    'account_status' =>
                        $user->status,

                    'destination' =>
                        '/account-restricted',
                ],
                null,
                403
            );
        }

        $user->tokens()
            ->where(
                'name',
                'servicelink-web'
            )
            ->delete();

        $abilities = match (
            $user->role
        ) {
            'administrator' => [
                'administrator',
            ],

            'provider' => [
                'provider',
            ],

            'customer' => [
                'customer',
            ],

            default => [],
        };

        $token = $user
            ->createToken(
                'servicelink-web',
                $abilities
            )
            ->plainTextToken;

        $user->forceFill([
            'last_login_at' => now(),
        ])->save();

        return $this->jsonResponse(
            true,
            'Login successful.',
            [
                'user' =>
                    $this->userPayload(
                        $user
                    ),

                'token' => $token,
                'token_type' => 'Bearer',

                'destination' =>
                    $this
                        ->destinationFor(
                            $user
                        ),
            ]
        );
    }

    public function me(
        Request $request
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();

        return $this->jsonResponse(
            true,
            'Authenticated user retrieved successfully.',
            [
                'user' =>
                    $this->userPayload(
                        $user
                    ),

                'destination' =>
                    $this
                        ->destinationFor(
                            $user
                        ),
            ]
        );
    }

    public function logout(
        Request $request
    ): JsonResponse {
        $user = $request->user();

        if ($user) {
            $token = $user
                ->currentAccessToken();

            if ($token) {
                $token->delete();
            }
        }

        return $this->jsonResponse(
            true,
            'Logout successful.',
            [
                'destination' => '/login',
            ]
        );
    }
}