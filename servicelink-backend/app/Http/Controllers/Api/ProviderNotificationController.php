<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProviderNotificationController extends Controller
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

    private function findProvider(
        string $providerPublicId
    ): ?object {
        return DB::table('users')
            ->where(
                'public_id',
                $providerPublicId
            )
            ->where(
                'role',
                'provider'
            )
            ->first();
    }

    private function safeActionPath(
        ?string $actionPath
    ): ?string {
        if ($actionPath === null) {
            return null;
        }

        $allowedPrefixes = [
            '/provider/dashboard',
            '/provider/profile',
            '/provider/qualifications',
            '/provider/services',
            '/provider/availability',
            '/provider/wanted-ads',
            '/provider/offers',
            '/provider/bookings',
            '/provider/earnings',
            '/provider/reviews',
            '/provider/complaints',
            '/provider/notifications',
            '/provider/statistics',
        ];

        foreach ($allowedPrefixes as $prefix) {
            if (
                $actionPath === $prefix
                || str_starts_with(
                    $actionPath,
                    $prefix . '/'
                )
            ) {
                return $actionPath;
            }
        }

        return null;
    }

    private function decorateNotification(
        object $notification
    ): object {
        $notification->is_read =
            $notification->read_at !== null;

        $notification->action_path =
            $this->safeActionPath(
                $notification->action_path
            );

        return $notification;
    }

    public function index(
        string $providerPublicId
    ): JsonResponse {
        $provider = $this->findProvider(
            $providerPublicId
        );

        if (!$provider) {
            return $this->jsonResponse(
                false,
                'Provider account not found.',
                null,
                null,
                404
            );
        }

        $notifications = DB::table(
            'notifications'
        )
            ->where(
                'user_id',
                $provider->id
            )
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
            ])
            ->orderByRaw(
                'CASE
                    WHEN read_at IS NULL
                        THEN 0
                    ELSE 1
                END'
            )
            ->orderByDesc('created_at')
            ->get()
            ->map(function (
                object $notification
            ): object {
                return $this
                    ->decorateNotification(
                        $notification
                    );
            });

        $unreadCount = $notifications
            ->where(
                'is_read',
                false
            )
            ->count();

        return $this->jsonResponse(
            true,
            'Provider notifications retrieved successfully.',
            [
                'provider_public_id' =>
                    $provider->public_id,

                'summary' => [
                    'total_count' =>
                        $notifications->count(),

                    'unread_count' =>
                        $unreadCount,

                    'read_count' =>
                        $notifications->count()
                        - $unreadCount,
                ],

                'items' => $notifications,
                'total' => $notifications->count(),
            ]
        );
    }

    public function markAsRead(
        string $providerPublicId,
        string $notificationPublicId
    ): JsonResponse {
        $provider = $this->findProvider(
            $providerPublicId
        );

        if (!$provider) {
            return $this->jsonResponse(
                false,
                'Provider account not found.',
                null,
                null,
                404
            );
        }

        $notification = DB::table(
            'notifications'
        )
            ->where(
                'public_id',
                $notificationPublicId
            )
            ->where(
                'user_id',
                $provider->id
            )
            ->first();

        if (!$notification) {
            return $this->jsonResponse(
                false,
                'Notification not found.',
                null,
                null,
                404
            );
        }

        if ($notification->read_at === null) {
            DB::table('notifications')
                ->where(
                    'id',
                    $notification->id
                )
                ->update([
                    'read_at' => now(),
                    'updated_at' => now(),
                ]);
        }

        $notification = DB::table(
            'notifications'
        )
            ->where(
                'id',
                $notification->id
            )
            ->first();

        return $this->jsonResponse(
            true,
            'Notification marked as read.',
            $this->decorateNotification(
                $notification
            )
        );
    }

    public function markAllAsRead(
        string $providerPublicId
    ): JsonResponse {
        $provider = $this->findProvider(
            $providerPublicId
        );

        if (!$provider) {
            return $this->jsonResponse(
                false,
                'Provider account not found.',
                null,
                null,
                404
            );
        }

        $updatedCount = DB::table(
            'notifications'
        )
            ->where(
                'user_id',
                $provider->id
            )
            ->whereNull('read_at')
            ->update([
                'read_at' => now(),
                'updated_at' => now(),
            ]);

        return $this->jsonResponse(
            true,
            'All provider notifications were marked as read.',
            [
                'updated_count' =>
                    $updatedCount,

                'unread_count' => 0,
            ]
        );
    }
}