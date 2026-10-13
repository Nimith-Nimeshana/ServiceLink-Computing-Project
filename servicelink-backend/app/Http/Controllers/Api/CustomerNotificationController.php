<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CustomerNotificationController extends Controller
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

    private function safeActionPath(?string $actionPath): ?string
    {
        if ($actionPath === null) {
            return null;
        }

        $allowedPrefixes = [
            '/customer/dashboard',
            '/customer/profile',
            '/customer/bookings',
            '/customer/wanted-ads',
            '/customer/offers',
            '/customer/reviews',
            '/customer/complaints',
            '/customer/notifications',
        ];

        foreach ($allowedPrefixes as $prefix) {
            if (
                $actionPath === $prefix
                || str_starts_with($actionPath, $prefix . '/')
            ) {
                return $actionPath;
            }
        }

        return null;
    }

    private function decorateNotification(object $notification): object
    {
        // is_read derived from read_at for both old and new schemas
        $notification->is_read = $notification->read_at !== null;

        // Ensure safe action_path
        $notification->action_path = $this->safeActionPath($notification->action_path);

        // Add time_ago for frontend display
        if (isset($notification->created_at)) {
            $notification->time_ago = \Carbon\Carbon::parse($notification->created_at)->diffForHumans();
        }

        return $notification;
    }

    /**
     * GET /customer/notifications
     * List all notifications for logged-in customer, unread first
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Check if table exists
        if (!Schema::hasTable('notifications')) {
            return $this->jsonResponse(true, 'No notifications table yet.', [
                'summary' => ['total_count' => 0, 'unread_count' => 0, 'read_count' => 0],
                'items' => [],
                'total' => 0
            ]);
        }

        $query = DB::table('notifications')
            ->where('user_id', $user->id)
            ->select([
                'id',
                'public_id',
                'user_id',
                'type',
                'title',
                'message',
                'related_type',
                'related_public_id',
                'action_path',
                'read_at',
                'created_at',
                'updated_at',
            ]);

        $notifications = $query
            ->orderByRaw('CASE WHEN read_at IS NULL THEN 0 ELSE 1 END')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn(object $n) => $this->decorateNotification($n));

        $unreadCount = $notifications->where('is_read', false)->count();

        return $this->jsonResponse(true, 'Customer notifications retrieved successfully.', [
            'summary' => [
                'total_count' => $notifications->count(),
                'unread_count' => $unreadCount,
                'read_count' => $notifications->count() - $unreadCount,
            ],
            'items' => $notifications,
            'total' => $notifications->count(),
        ]);
    }

    /**
     * POST /customer/notifications/{notificationPublicId}/read
     * Mark single notification as read
     */
    public function markAsRead(Request $request, string $notificationPublicId): JsonResponse
    {
        $user = $request->user();

        $notification = DB::table('notifications')
            ->where('public_id', $notificationPublicId)
            ->where('user_id', $user->id)
            ->first();

        if (!$notification) {
            return $this->jsonResponse(false, 'Notification not found.', null, null, 404);
        }

        if ($notification->read_at === null) {
            $updateData = [
                'read_at' => now(),
                'updated_at' => now(),
            ];

            // If SAFE migration added is_read column, update it too
            if (Schema::hasColumn('notifications', 'is_read')) {
                $updateData['is_read'] = true;
            }

            DB::table('notifications')
                ->where('id', $notification->id)
                ->update($updateData);
        }

        $notification = DB::table('notifications')->where('id', $notification->id)->first();

        return $this->jsonResponse(true, 'Notification marked as read.', $this->decorateNotification($notification));
    }

    /**
     * POST /customer/notifications/read-all
     * Mark all customer notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();

        $updateData = [
            'read_at' => now(),
            'updated_at' => now(),
        ];

        if (Schema::hasColumn('notifications', 'is_read')) {
            $updateData['is_read'] = true;
        }

        $updatedCount = DB::table('notifications')
            ->where('user_id', $user->id)
            ->whereNull('read_at')
            ->update($updateData);

        return $this->jsonResponse(true, 'All notifications marked as read.', [
            'updated_count' => $updatedCount,
            'unread_count' => 0,
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!\Illuminate\Support\Facades\Schema::hasTable('notifications')) {
            return $this->jsonResponse(true, 'No notifications table.', ['unread_count' => 0]);
        }
        $count = 0;
        try {
            $count = \Illuminate\Support\Facades\DB::table('notifications')->where('user_id', $user->id)->whereNull('read_at')->count();
        } catch (\Exception $e) { $count = 0; }
        return $this->jsonResponse(true, 'Unread count retrieved.', ['unread_count' => $count]);
    }
}
