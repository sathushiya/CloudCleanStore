<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function index(): JsonResponse
    {
        $notifications = Notification::query()->latest()->limit(100)->get();

        return response()->json(['success' => true, 'data' => $notifications]);
    }

    public function markRead(Notification $notification): JsonResponse
    {
        $notification->update(['read_at' => now()]);

        return response()->json(['success' => true, 'data' => $notification]);
    }

    public function markAllRead(): JsonResponse
    {
        Notification::unread()->update(['read_at' => now()]);

        return response()->json(['success' => true, 'message' => 'All notifications marked as read.']);
    }

    public function destroy(Notification $notification): JsonResponse
    {
        $notification->delete();

        return response()->json(['success' => true, 'message' => 'Notification deleted.']);
    }

    public function clearAll(): JsonResponse
    {
        Notification::query()->delete();

        return response()->json(['success' => true, 'message' => 'All notifications cleared.']);
    }
}
