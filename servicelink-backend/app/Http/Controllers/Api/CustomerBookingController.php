<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Helpers\NotificationHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CustomerBookingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $bookings = DB::table('bookings')
            ->leftJoin('users as provider', 'provider.id', '=', 'bookings.provider_id')
            ->leftJoin('services', 'services.id', '=', 'bookings.service_id')
            ->where('bookings.customer_id', $user->id)
            ->select(
                'bookings.*',
                'provider.name as provider_name',
                'provider.public_id as provider_public_id',
                'services.title as service_title',
                'services.public_id as service_public_id'
            )
            ->orderByDesc('bookings.created_at')
            ->get();

        return response()->json(['success' => true, 'data' => $bookings]);
    }

    public function show(Request $request, $publicId)
    {
        $user = $request->user();
        $booking = DB::table('bookings')
            ->leftJoin('users as provider', 'provider.id', '=', 'bookings.provider_id')
            ->leftJoin('services', 'services.id', '=', 'bookings.service_id')
            ->where('bookings.public_id', $publicId)
            ->where('bookings.customer_id', $user->id)
            ->select('bookings.*', 'provider.name as provider_name', 'provider.public_id as provider_public_id', 'provider.email as provider_email', 'services.title as service_title')
            ->first();

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Booking not found'], 404);
        }

        $history = DB::table('booking_status_histories')
            ->where('booking_id', $booking->id)
            ->orderBy('changed_at')
            ->orderBy('created_at')
            ->get();

        $relatedOffer = null;
        if ($booking->offer_id) {
            $relatedOffer = DB::table('offers')->where('id', $booking->offer_id)->first();
        } elseif ($booking->id) {
            $relatedOffer = DB::table('offers')->where('booking_id', $booking->id)->first();
        }

        return response()->json([
            'success' => true,
            'data' => $booking,
            'history' => $history,
            'related_offer' => $relatedOffer
        ]);
    }

    // Direct booking creation from service page
    public function store(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'service_public_id' => 'nullable|string|exists:services,public_id',
            'provider_public_id' => 'required|string|exists:users,public_id',
            'scheduled_date' => 'required|date|after_or_equal:today',
            'scheduled_time' => 'required',
            'duration_minutes' => 'nullable|integer|min:15|max:480',
            'task_description' => 'nullable|string|max:2000',
            'district' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:500',
            'customer_note' => 'nullable|string|max:1000',
        ]);

        $provider = DB::table('users')->where('public_id', $validated['provider_public_id'])->where('role', 'provider')->first();
        if (!$provider) {
            return response()->json(['success' => false, 'message' => 'Provider not found'], 404);
        }

        $service = null;
        $serviceId = null;
        if (!empty($validated['service_public_id'])) {
            $service = DB::table('services')->where('public_id', $validated['service_public_id'])->first();
            $serviceId = $service->id ?? null;
        }

        $publicId = 'BK-' . strtoupper(Str::random(6)) . random_int(100, 999);
        $title = $service ? $service->title : ($validated['task_description'] ? Str::limit($validated['task_description'], 50) : 'Direct booking');

        // Default pricing if no service
        $agreed = $service ? ($service->price ?? 3500) : 3500;
        $rate = 10.00;
        $commission = round($agreed * $rate / 100, 2);
        $net = round($agreed - $commission, 2);

        $bookingId = DB::table('bookings')->insertGetId([
            'public_id' => $publicId,
            'customer_id' => $user->id,
            'provider_id' => $provider->id,
            'service_id' => $serviceId,
            'title' => $title,
            'source' => 'Direct booking',
            'scheduled_date' => $validated['scheduled_date'],
            'scheduled_time' => $validated['scheduled_time'],
            'duration_minutes' => $validated['duration_minutes'] ?? 60,
            'task_description' => $validated['task_description'] ?? null,
            'district' => $validated['district'] ?? null,
            'address' => $validated['address'] ?? null,
            'customer_note' => $validated['customer_note'] ?? null,
            'date_display' => date('d M Y', strtotime($validated['scheduled_date'])),
            'agreed_amount' => $agreed,
            'commission_rate' => $rate,
            'commission_amount' => $commission,
            'provider_net_amount' => $net,
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('booking_status_histories')->insert([
            'booking_id' => $bookingId,
            'from_status' => null,
            'to_status' => 'pending',
            'changed_by' => $user->id,
            'changed_by_role' => 'customer',
            'note' => 'Booking request created by customer',
            'changed_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Notify provider
        try {
            NotificationHelper::create(
                $provider->id,
                'booking',
                'New booking request',
                'Customer ' . $user->name . ' requested booking ' . $publicId . ' for ' . $title,
                'booking',
                $publicId,
                '/provider/bookings/' . $publicId
            );
            NotificationHelper::create(
                $user->id,
                'booking',
                'Booking request sent',
                'Your booking ' . $publicId . ' for ' . $title . ' was sent to ' . $provider->name . '. Waiting for acceptance.',
                'booking',
                $publicId,
                '/customer/bookings/' . $publicId
            );
        } catch (\Exception $e) {}

        $booking = DB::table('bookings')->where('id', $bookingId)->first();

        return response()->json(['success' => true, 'message' => 'Booking created: ' . $publicId, 'data' => $booking], 201);
    }

    public function cancel(Request $request, $publicId)
    {
        $user = $request->user();
        $booking = DB::table('bookings')->where('public_id', $publicId)->where('customer_id', $user->id)->first();
        
        if (!$booking) return response()->json(['success' => false, 'message' => 'Booking not found'], 404);
        if (!in_array($booking->status, ['pending', 'accepted'])) {
            return response()->json(['success' => false, 'message' => 'Only pending or accepted bookings can be cancelled. Current: ' . $booking->status], 422);
        }

        DB::table('bookings')->where('id', $booking->id)->update(['status' => 'cancelled', 'updated_at' => now()]);
        
        DB::table('booking_status_histories')->insert([
            'booking_id' => $booking->id,
            'from_status' => $booking->status,
            'to_status' => 'cancelled',
            'changed_by' => $user->id,
            'changed_by_role' => 'customer',
            'note' => $request->input('note') ?? 'Cancelled by customer',
            'changed_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        try {
            NotificationHelper::create(
                $booking->provider_id,
                'booking',
                'Booking cancelled',
                'Customer cancelled booking ' . $booking->public_id . ' (' . $booking->title . ').',
                'booking',
                $booking->public_id,
                '/provider/bookings/' . $booking->public_id
            );
        } catch (\Exception $e) {}

        return response()->json(['success' => true, 'message' => 'Booking cancelled']);
    }

    public function complete(Request $request, $publicId)
    {
        $user = $request->user();
        $booking = DB::table('bookings')->where('public_id', $publicId)->where('customer_id', $user->id)->first();
        
        if (!$booking) return response()->json(['success' => false, 'message' => 'Booking not found'], 404);
        if ($booking->status !== 'accepted' && $booking->status !== 'in progress') {
            return response()->json(['success' => false, 'message' => 'Only accepted or in-progress bookings can be completed. Current: ' . $booking->status], 422);
        }

        DB::table('bookings')->where('id', $booking->id)->update(['status' => 'completed', 'completed_at' => now(), 'updated_at' => now()]);
        
        DB::table('booking_status_histories')->insert([
            'booking_id' => $booking->id,
            'from_status' => $booking->status,
            'to_status' => 'completed',
            'changed_by' => $user->id,
            'changed_by_role' => 'customer',
            'note' => 'Marked completed by customer',
            'changed_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        try {
            NotificationHelper::create(
                $booking->provider_id,
                'booking',
                'Booking completed',
                'Customer marked booking ' . $booking->public_id . ' (' . $booking->title . ') as completed.',
                'booking',
                $booking->public_id,
                '/provider/bookings/' . $booking->public_id
            );
        } catch (\Exception $e) {}

        return response()->json(['success' => true, 'message' => 'Booking completed - you can now leave a review']);
    }

    public function stats(Request $request)
    {
        $user = $request->user();
        $stats = [
            'total' => DB::table('bookings')->where('customer_id', $user->id)->count(),
            'pending' => DB::table('bookings')->where('customer_id', $user->id)->where('status', 'pending')->count(),
            'accepted' => DB::table('bookings')->where('customer_id', $user->id)->where('status', 'accepted')->count(),
            'completed' => DB::table('bookings')->where('customer_id', $user->id)->where('status', 'completed')->count(),
            'cancelled' => DB::table('bookings')->where('customer_id', $user->id)->where('status', 'cancelled')->count(),
        ];
        return response()->json(['success' => true, 'data' => $stats]);
    }
}
