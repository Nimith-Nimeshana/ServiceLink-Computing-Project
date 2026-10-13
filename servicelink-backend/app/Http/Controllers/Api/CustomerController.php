<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\CustomerProfile;

class CustomerController extends Controller
{
    // Fetches the user AND their connected customer profile
    public function getProfile(Request $request)
    {
        $user = $request->user();
        $user->profile = CustomerProfile::where('user_id', $user->id)->first();

        return response()->json([
            'success' => true,
            'message' => 'Customer profile loaded.',
            'data' => ['user' => $user],
            'errors' => null
        ]);
    }

    // Validates and saves changes to both tables
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:150',
            'phone' => 'nullable|string|max:30',
            'district' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'data' => null,
                'errors' => $validator->errors()
            ], 422); // Standard validation error code
        }

        // 1. Update core users table
        $user->update([
            'name' => $request->name,
            'phone' => $request->phone,
        ]);

        // 2. Update customer_profiles table
        CustomerProfile::updateOrCreate(
            ['user_id' => $user->id],
            ['district' => $request->district]
        );

        $user->profile = CustomerProfile::where('user_id', $user->id)->first();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data' => ['user' => $user],
            'errors' => null
        ]);
    }
}