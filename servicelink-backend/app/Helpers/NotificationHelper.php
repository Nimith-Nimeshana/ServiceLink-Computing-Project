<?php

namespace App\Helpers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class NotificationHelper
{
    /**
     * Generate unique public_id like NT-ABC123
     */
    private static function generatePublicId(): string
    {
        do {
            $id = 'NT-' . strtoupper(Str::random(6)) . random_int(100, 999);
        } while (DB::table('notifications')->where('public_id', $id)->exists());
        return $id;
    }

    /**
     * Create a notification for any user (customer, provider, admin)
     * 
     * @param int $userId - recipient user_id (FK users.id)
     * @param string $type - offer, booking, complaint, review, payment, general
     * @param string $title - short title
     * @param string $message - full message
     * @param string|null $relatedType - booking, wanted_ad, offer, complaint, review
     * @param string|null $relatedPublicId - e.g., BK-1042, WA-208, OF-501, CP-081
     * @param string|null $actionPath - frontend route to navigate, e.g., /customer/bookings/BK-1042
     * @return object|null - created notification or null if failed
     */
    public static function create(
        int $userId,
        string $type,
        string $title,
        string $message,
        ?string $relatedType = null,
        ?string $relatedPublicId = null,
        ?string $actionPath = null
    ): ?object {
        try {
            if (!Schema::hasTable('notifications')) {
                return null;
            }

            $publicId = self::generatePublicId();

            $insertData = [
                'public_id' => $publicId,
                'user_id' => $userId,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'related_type' => $relatedType,
                'related_public_id' => $relatedPublicId,
                'action_path' => $actionPath,
                'read_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Compatibility with SAFE migration that added extra columns
            if (Schema::hasColumn('notifications', 'is_read')) {
                $insertData['is_read'] = false;
            }
            if (Schema::hasColumn('notifications', 'notifiable_id')) {
                $insertData['notifiable_id'] = $userId;
            }
            if (Schema::hasColumn('notifications', 'notifiable_type')) {
                $insertData['notifiable_type'] = 'App\\Models\\User';
            }
            if (Schema::hasColumn('notifications', 'data')) {
                $insertData['data'] = json_encode([
                    'related_type' => $relatedType,
                    'related_public_id' => $relatedPublicId,
                    'action_path' => $actionPath,
                ]);
            }

            DB::table('notifications')->insert($insertData);

            return DB::table('notifications')->where('public_id', $publicId)->first();
        } catch (\Exception $e) {
            // Log but don't break main transaction
            \Illuminate\Support\Facades\Log::error('Notification creation failed: ' . $e->getMessage(), [
                'user_id' => $userId,
                'type' => $type,
                'title' => $title,
            ]);
            return null;
        }
    }

    /**
     * Shortcut helpers for common events
     */
    public static function notifyCustomerOfferReceived(int $customerId, string $wantedAdPublicId, string $offerPublicId, string $providerName): ?object
    {
        return self::create(
            $customerId,
            'offer',
            'New offer received',
            $providerName . ' submitted an offer for your wanted ad ' . $wantedAdPublicId . '.',
            'offer',
            $offerPublicId,
            '/customer/offers/' . $offerPublicId
        );
    }

    public static function notifyBookingStatusChanged(int $userId, string $bookingPublicId, string $status, string $role = 'customer'): ?object
    {
        $pathPrefix = $role === 'provider' ? '/provider/bookings/' : '/customer/bookings/';
        return self::create(
            $userId,
            'booking',
            'Booking ' . ucfirst($status),
            'Booking ' . $bookingPublicId . ' is now ' . $status . '.',
            'booking',
            $bookingPublicId,
            $pathPrefix . $bookingPublicId
        );
    }

    public static function notifyComplaintUpdate(int $userId, string $complaintPublicId, string $message = 'Your complaint has been updated.'): ?object
    {
        return self::create(
            $userId,
            'complaint',
            'Complaint updated',
            $message,
            'complaint',
            $complaintPublicId,
            '/customer/complaints/' . $complaintPublicId
        );
    }
}
