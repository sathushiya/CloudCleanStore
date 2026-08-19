<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            'success' => true,
            'data' => $user->only([
                'id', 'name', 'email', 'phone_number', 'phone_verified_at', 'has_whatsapp', 'created_at',
            ]),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $user = $request->user();
        $user->update(['name' => $request->name]);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data' => $user->only(['id', 'name', 'email', 'phone_number']),
        ]);
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        $request->validate([
            'notify_push' => ['sometimes', 'boolean'],
            'notify_email' => ['sometimes', 'boolean'],
            'notify_sms' => ['sometimes', 'boolean'],
        ]);

        $request->user()->update($request->only(['notify_push', 'notify_email', 'notify_sms']));

        return response()->json(['success' => true, 'message' => 'Preferences updated.']);
    }
}
