<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            'success' => true,
            'data' => $user->only([
                'id', 'name', 'email', 'phone_number', 'phone_verified_at', 'has_whatsapp', 'created_at',
                'notify_push', 'notify_email', 'notify_sms',
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

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => [
                'required',
                'string',
                'min:8',
                'confirmed', // requires new_password_confirmation field
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[0-9]/',
                'regex:/[!@#$%^&*(),.?":{}|<>]/',
            ],
        ], [
            'new_password.regex' => 'New password must include uppercase, lowercase, number, and special character',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        $user->update(['password' => $request->new_password]);

        return response()->json(['success' => true, 'message' => 'Password updated successfully.']);
    }
}
