<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Services\OtpService;
use App\Services\PhoneService;
use App\Services\SmsService;
use App\Services\WhatsAppCheckService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PhoneVerificationController extends Controller
{
    public function __construct(
        private PhoneService $phoneService,
        private WhatsAppCheckService $whatsAppCheckService,
        private OtpService $otpService,
        private SmsService $smsService,
    ) {
    }

    public function checkWhatsapp(Request $request): JsonResponse
    {
        $request->validate(['phone' => ['required', 'string']]);

        $validation = $this->phoneService->validate($request->phone);
        if (!$validation['valid']) {
            return response()->json(['success' => false, 'message' => $validation['message']], 422);
        }

        $hasWhatsapp = $this->whatsAppCheckService->check($validation['formatted']);

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

        $otp = $this->otpService->generateForPhone($validation['formatted'], 'phone_verification');
        $this->smsService->sendOtp($validation['formatted'], $otp);

        return response()->json(['success' => true, 'message' => 'Verification code sent.']);
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

        $hasWhatsapp = $this->whatsAppCheckService->check($validation['formatted']);

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