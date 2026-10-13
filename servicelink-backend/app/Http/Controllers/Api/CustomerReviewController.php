<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CustomerReviewController extends Controller
{
    /**
     * Generate unique public ID like RV-ABC123
     */
    private function genPublicId(): string
    {
        do {
            $id = 'RV-' . strtoupper(Str::random(6)) . random_int(100, 999);
        } while (DB::table('reviews')->where('public_id', $id)->exists());
        return $id;
    }

    /**
     * GET /customer/reviews
     * List all reviews written by this customer, with booking and provider info
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $reviews = DB::table('reviews')
            ->leftJoin('bookings', 'bookings.id', '=', 'reviews.booking_id')
            ->leftJoin('users as provider', 'provider.id', '=', 'reviews.provider_id')
            ->where('reviews.customer_id', $user->id)
            ->select(
                'reviews.*',
                'bookings.public_id as booking_public_id',
                'bookings.title as booking_title',
                'provider.name as provider_name',
                'provider.public_id as provider_public_id'
            )
            ->orderByDesc('reviews.created_at')
            ->get();

        return response()->json(['success' => true, 'data' => $reviews]);
    }

    /**
     * GET /customer/reviews/eligible
     * Completed bookings that have no review yet - for "Review another completed booking" button
     */
    public function eligible(Request $request)
    {
        $user = $request->user();

        // Completed bookings where no review exists yet for that booking
        $eligible = DB::table('bookings')
            ->leftJoin('users as provider', 'provider.id', '=', 'bookings.provider_id')
            ->leftJoin('reviews', 'reviews.booking_id', '=', 'bookings.id')
            ->where('bookings.customer_id', $user->id)
            ->where('bookings.status', 'completed')
            ->whereNull('reviews.id') // No review yet
            ->select(
                'bookings.*',
                'provider.name as provider_name',
                'provider.public_id as provider_public_id'
            )
            ->orderByDesc('bookings.updated_at')
            ->get();

        return response()->json(['success' => true, 'data' => $eligible]);
    }

    /**
     * GET /customer/bookings/{publicId}/review-info
     * Check if a specific booking is eligible for review and return its info
     */
    public function reviewInfo(Request $request, $publicId)
    {
        $user = $request->user();

        $booking = DB::table('bookings')
            ->leftJoin('users as provider', 'provider.id', '=', 'bookings.provider_id')
            ->where('bookings.public_id', $publicId)
            ->where('bookings.customer_id', $user->id)
            ->select('bookings.*', 'provider.name as provider_name', 'provider.public_id as provider_public_id')
            ->first();

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Booking not found'], 404);
        }

        if ($booking->status !== 'completed') {
            return response()->json(['success' => false, 'message' => 'Only completed bookings can be reviewed. Current status: ' . $booking->status], 422);
        }

        $existing = DB::table('reviews')->where('booking_id', $booking->id)->first();
        if ($existing) {
            return response()->json(['success' => false, 'message' => 'This booking already has a review: ' . $existing->public_id, 'data' => $existing], 422);
        }

        return response()->json(['success' => true, 'data' => $booking]);
    }

    /**
     * POST /customer/bookings/{publicId}/reviews
     * Create review for completed booking - validates rating 1-5, creates RV-xxx
     */
    public function store(Request $request, $publicId)
    {
        $user = $request->user();

        // Validate rating and comment
        $v = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:10|max:1000',
        ]);

        if ($v->fails()) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $v->errors()], 422);
        }

        $booking = DB::table('bookings')->where('public_id', $publicId)->where('customer_id', $user->id)->first();
        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Booking not found'], 404);
        }

        if ($booking->status !== 'completed') {
            return response()->json(['success' => false, 'message' => 'Only completed bookings can be reviewed'], 422);
        }

        $existing = DB::table('reviews')->where('booking_id', $booking->id)->first();
        if ($existing) {
            return response()->json(['success' => false, 'message' => 'Review already exists for this booking'], 422);
        }

        // Create review
        $reviewPublicId = $this->genPublicId();
        $data = $v->validated();

        $id = DB::table('reviews')->insertGetId([
            'public_id' => $reviewPublicId,
            'booking_id' => $booking->id,
            'customer_id' => $user->id,
            'provider_id' => $booking->provider_id,
            'rating' => $data['rating'],
            'comment' => $data['comment'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $review = DB::table('reviews')->where('id', $id)->first();

        // Optional: Update provider average rating cache if providers table has rating column
        try {
            $avg = DB::table('reviews')->where('provider_id', $booking->provider_id)->avg('rating');
            $count = DB::table('reviews')->where('provider_id', $booking->provider_id)->count();
            // If providers have rating columns, update them (safe to ignore if not exists)
            DB::table('users')->where('id', $booking->provider_id)->update([
                'avg_rating' => round($avg, 2),
                'reviews_count' => $count,
            ]);
        } catch (\Exception $e) {
            // Column may not exist, ignore
        }

        return response()->json(['success' => true, 'message' => 'Review submitted: ' . $reviewPublicId, 'data' => $review], 201);
    }
}