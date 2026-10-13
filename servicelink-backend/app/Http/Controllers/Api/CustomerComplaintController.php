<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Helpers\NotificationHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CustomerComplaintController extends Controller
{
    // Generate unique public ID like CP-ABC123
    private function genPublicId(): string
    {
        do {
            $id = 'CP-' . strtoupper(Str::random(6)) . random_int(100, 999);
        } while (DB::table('complaints')->where('public_id', $id)->exists());
        return $id;
    }

    /**
     * Detect which customer-related columns exist in your complaints table
     * Your error shows you have complainant_id, but other projects use customer_id or user_id
     * This returns list of columns that actually exist
     */
    private function getCustomerColumns(): array
    {
        $cols = [];
        // Check all possible variants your table might have
        if (Schema::hasColumn('complaints', 'complainant_id')) $cols[] = 'complainant_id';
        if (Schema::hasColumn('complaints', 'customer_id')) $cols[] = 'customer_id';
        if (Schema::hasColumn('complaints', 'user_id')) $cols[] = 'user_id';
        if (Schema::hasColumn('complaints', 'customer_user_id')) $cols[] = 'customer_user_id';
        // Fallback if none found (should not happen)
        if (empty($cols)) $cols[] = 'complainant_id'; // your table has this
        return $cols;
    }

    /**
     * Get the primary column to filter by (prefer complainant_id if exists, else customer_id, else user_id)
     */
    private function getPrimaryCustomerColumn(): string
    {
        if (Schema::hasColumn('complaints', 'complainant_id')) return 'complainant_id';
        if (Schema::hasColumn('complaints', 'customer_id')) return 'customer_id';
        if (Schema::hasColumn('complaints', 'user_id')) return 'user_id';
        return 'complainant_id'; // fallback for your DB
    }

    /**
     * GET /customer/complaints
     * List all complaints by this customer - works with any column name
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $primaryCol = $this->getPrimaryCustomerColumn();

        $complaints = DB::table('complaints')
            ->leftJoin('bookings', 'bookings.id', '=', 'complaints.booking_id')
            ->leftJoin('users as provider', 'provider.id', '=', 'bookings.provider_id')
            ->where('complaints.' . $primaryCol, $user->id)
            ->select(
                'complaints.*',
                'bookings.public_id as booking_public_id',
                'bookings.title as booking_title',
                'provider.name as provider_name'
            )
            ->orderByDesc('complaints.created_at')
            ->get();

        return response()->json(['success' => true, 'data' => $complaints]);
    }

    /**
     * GET /customer/complaints/{publicId}
     */
    public function show(Request $request, $publicId)
    {
        $user = $request->user();
        $primaryCol = $this->getPrimaryCustomerColumn();

        $complaint = DB::table('complaints')
            ->leftJoin('bookings', 'bookings.id', '=', 'complaints.booking_id')
            ->leftJoin('users as provider', 'provider.id', '=', 'bookings.provider_id')
            ->where('complaints.public_id', $publicId)
            ->where('complaints.' . $primaryCol, $user->id)
            ->select('complaints.*', 'bookings.public_id as booking_public_id', 'bookings.title as booking_title', 'provider.name as provider_name')
            ->first();

        if (!$complaint) {
            return response()->json(['success' => false, 'message' => 'Complaint not found'], 404);
        }

        // Try to load admin responses if table exists
        try {
            $responses = DB::table('complaint_responses')->where('complaint_id', $complaint->id)->orderBy('created_at')->get();
        } catch (\Exception $e) {
            $responses = [];
        }

        return response()->json(['success' => true, 'data' => $complaint, 'responses' => $responses]);
    }

    /**
     * GET /customer/complaints/eligible-bookings
     */
    public function eligibleBookings(Request $request)
    {
        $user = $request->user();
        $bookings = DB::table('bookings')
            ->leftJoin('users as provider', 'provider.id', '=', 'bookings.provider_id')
            ->where('bookings.customer_id', $user->id)
            ->whereIn('bookings.status', ['accepted', 'completed', 'cancelled'])
            ->select('bookings.*', 'provider.name as provider_name')
            ->orderByDesc('bookings.created_at')
            ->get();
        return response()->json(['success' => true, 'data' => $bookings]);
    }

    /**
     * POST /customer/complaints
     * FINAL FIX: Fills complainant_id + customer_id + user_id - whichever columns exist
     * This solves your error: Field 'complainant_id' doesn't have a default value
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $customerCols = $this->getCustomerColumns(); // e.g., ['complainant_id', 'customer_id']

        $v = Validator::make($request->all(), [
            'booking_public_id' => 'nullable|string|exists:bookings,public_id',
            'subject' => 'required|string|min:5|max:191',
            'description' => 'required|string|min:20|max:2000',
            'category' => 'nullable|string|max:100',
        ]);

        if ($v->fails()) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $v->errors()], 422);
        }

        $data = $v->validated();

        // Resolve booking_id from public_id
        $bookingId = null;
        if (!empty($data['booking_public_id'])) {
            $booking = DB::table('bookings')->where('public_id', $data['booking_public_id'])->where('customer_id', $user->id)->first();
            if (!$booking) {
                return response()->json(['success' => false, 'message' => 'Booking not found or not yours'], 404);
            }
            $bookingId = $booking->id;
        }

        $publicId = $this->genPublicId();

        // Build base insert
        $insert = [
            'public_id' => $publicId,
            'booking_id' => $bookingId,
            'subject' => $data['subject'],
            'description' => $data['description'],
            'category' => $data['category'] ?? 'payment', // your test used payment
            'status' => 'under_review',
            'created_at' => now(),
            'updated_at' => now(),
        ];

        // CRITICAL FIX: Fill ALL customer-related columns that exist in your table
        // If your table has complainant_id, we fill it. If it has customer_id, we fill it. If both, fill both.
        foreach ($customerCols as $col) {
            $insert[$col] = $user->id;
        }

        // Extra safety: also fill complainant_id directly if column exists but wasn't in list (race condition)
        if (Schema::hasColumn('complaints', 'complainant_id') && !isset($insert['complainant_id'])) {
            $insert['complainant_id'] = $user->id;
        }

        // Log what we're inserting for debugging (remove after fix)
        // \Log::info('Complaint insert', $insert);

        $id = DB::table('complaints')->insertGetId($insert);
        $complaint = DB::table('complaints')->where('id', $id)->first();

        // --- NOTIFICATIONS: Notify provider (if complaint against booking) and customer ---
        try {
            // Notify customer confirmation
            NotificationHelper::create(
                $user->id,
                'complaint',
                'Complaint submitted',
                'Your complaint ' . $publicId . ' about "' . $data['subject'] . '" has been submitted and is under review.',
                'complaint',
                $publicId,
                '/customer/complaints/' . $publicId
            );

            // If complaint is about a booking, notify provider
            if ($bookingId) {
                $booking = DB::table('bookings')->where('id', $bookingId)->first();
                if ($booking && $booking->provider_id) {
                    NotificationHelper::create(
                        $booking->provider_id,
                        'complaint',
                        'New complaint received',
                        'Customer filed complaint ' . $publicId . ' regarding booking ' . $booking->public_id . '.',
                        'complaint',
                        $publicId,
                        '/provider/complaints/' . $publicId
                    );
                }
            }
        } catch (\Exception $e) {}

        return response()->json(['success' => true, 'message' => 'Complaint submitted: ' . $publicId, 'data' => $complaint], 201);
    }
}
