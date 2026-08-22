<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Services\OtpService;
use App\Services\PhoneService;
use App\Services\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PhoneVerificationController extends Controller
{
    public function __construct(
        private PhoneService $phoneService,
        private WhatsAppService $whatsAppService,
        private OtpService $otpService,
    ) {
    }

    public function checkWhatsapp(Request $request): JsonResponse
    {
        $request->validate(['phone' => ['required', 'string']]);

        $validation = $this->phoneService->validate($request->phone);
        if (!$validation['valid']) {
            return response()->json(['success' => false, 'message' => $validation['message']], 422);
        }

        $hasWhatsapp = $this->whatsAppService->check($validation['formatted']);

        return response()->json([
            'success' => true,
            'data' => [
                'formatted' => $validation['formatted'],
                'has_whatsapp' => $hasWhatsapp,
            ],
        ]);
    }

    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate(['phone' => ['required', 'string']]);

        $validation = $this->phoneService->validate($request->phone);
        if (!$validation['valid']) {
            return response()->json(['success' => false, 'message' => $validation['message']], 422);
        }

        // Verification is WhatsApp-only -- the OTP can't be delivered any
        // other way, so a number that doesn't have WhatsApp can't proceed.
        $hasWhatsapp = $this->whatsAppService->check($validation['formatted']);
        if ($hasWhatsapp === false) {
            return response()->json([
                'success' => false,
                'message' => 'This number does not appear to have WhatsApp. Please use a WhatsApp-enabled number.',
            ], 422);
        }

        $otp = $this->otpService->generateForPhone($validation['formatted'], 'phone_verification');
        $sent = $this->whatsAppService->sendOtp($validation['formatted'], $otp);

        if (!$sent) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send the WhatsApp message. Please try again in a moment.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Verification code sent via WhatsApp.',
            'data' => ['has_whatsapp' => $hasWhatsapp],
        ]);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => ['required', 'string'],
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $validation = $this->phoneService->validate($request->phone);
        if (!$validation['valid']) {
            return response()->json(['success' => false, 'message' => $validation['message']], 422);
        }

        $result = $this->otpService->verifyForPhone($validation['formatted'], $request->otp, 'phone_verification');

        if ($result !== 'valid') {
            $messages = [
                'expired' => 'This code has expired. Please request a new one.',
                'used' => 'This code has already been used.',
                'invalid' => 'Incorrect code. Please try again.',
            ];
            return response()->json(['success' => false, 'message' => $messages[$result] ?? 'Verification failed.'], 422);
        }

        $hasWhatsapp = $this->whatsAppService->check($validation['formatted']);

        $user = $request->user();
        $user->update([
            'phone_number' => $validation['formatted'],
            'phone_verified_at' => now(),
            'has_whatsapp' => $hasWhatsapp,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Phone number verified successfully.',
            'data' => [
                'phone_number' => $user->phone_number,
                'phone_verified_at' => $user->phone_verified_at,
                'has_whatsapp' => $user->has_whatsapp,
            ],
        ]);
    }
}
