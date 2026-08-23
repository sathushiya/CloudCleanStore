<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\OtpVerifyRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\RefreshToken;
use App\Models\User;
use App\Services\OtpService;
use App\Services\PhoneService;
use App\Services\TokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function __construct(
        private OtpService $otpService,
        private TokenService $tokenService,
        private PhoneService $phoneService,
    ) {}

    // ─── Registration ────────────────────────────────────────────────────────

    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $phoneResult = $this->phoneService->validate($request->phone_number);
            if (!$phoneResult['valid']) {
                return response()->json([
                    'success' => false,
                    'message' => $phoneResult['message'],
                ], 422);
            }

            // Create user (password auto-hashed by model cast)
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => $request->password,
                'phone_number' => $phoneResult['formatted'],
                'role' => 'customer',
            ]);

            // Generate and send OTP
            $otp = $this->otpService->generate($user->email, 'email_verification');
            $this->otpService->sendEmail($user->email, $otp, 'email_verification');

            return response()->json([
                'success' => true,
                'message' => 'Registration successful. Please check your email for the OTP verification code.',
                'data' => [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'requires_verification' => true,
                ],
            ], 201);

        } catch (\Exception $e) {
            Log::error('Registration failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Registration failed. Please try again.',
            ], 500);
        }
    }

    // ─── Email OTP Verification ──────────────────────────────────────────────

    public function verifyEmail(OtpVerifyRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        if ($user->isEmailVerified()) {
            return response()->json([
                'success' => false,
                'message' => 'Email is already verified',
            ], 409);
        }

        $result = $this->otpService->verify($request->email, $request->otp, 'email_verification');

        return match ($result) {
            'valid' => $this->activateUser($user, $request),
            'expired' => response()->json(['success' => false, 'message' => 'OTP has expired. Please request a new one.'], 410),
            'used' => response()->json(['success' => false, 'message' => 'OTP has already been used.'], 409),
            default => response()->json(['success' => false, 'message' => 'Invalid OTP. Please check and try again.'], 422),
        };
    }

    private function activateUser(User $user, Request $request): JsonResponse
    {
        $user->update(['email_verified_at' => now()]);
        $tokens = $this->tokenService->createTokenPair($user, $request);

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully. Welcome to Cloud Clean Store!',
            'data' => [
                'user' => $this->formatUser($user),
                'tokens' => $tokens,
            ],
        ]);
    }

    // ─── Resend OTP ──────────────────────────────────────────────────────────

    public function resendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'type' => ['required', 'in:email_verification,password_reset'],
        ]);

        $user = User::where('email', $request->email)->first();

        if ($request->type === 'email_verification' && $user->isEmailVerified()) {
            return response()->json(['success' => false, 'message' => 'Email is already verified'], 409);
        }

        $otp = $this->otpService->generate($request->email, $request->type);
        $this->otpService->sendEmail($request->email, $otp, $request->type);

        return response()->json([
            'success' => true,
            'message' => 'A new OTP has been sent to your email address.',
        ]);
    }

    // ─── Login ───────────────────────────────────────────────────────────────

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        // Check user exists and password matches
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password',
            ], 401);
        }

        // Check account is active
        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact support.',
            ], 403);
        }

        // Check email is verified
        if (!$user->isEmailVerified()) {
            // Resend OTP for convenience
            $otp = $this->otpService->generate($user->email, 'email_verification');
            $this->otpService->sendEmail($user->email, $otp, 'email_verification');

            return response()->json([
                'success' => false,
                'message' => 'Please verify your email first. A new OTP has been sent to your email.',
                'data' => [
                    'requires_verification' => true,
                    'email' => $user->email,
                ],
            ], 403);
        }

        // Create tokens
        $tokens = $this->tokenService->createTokenPair($user, $request);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => $this->formatUser($user),
                'tokens' => $tokens,
                'remember_me' => (bool) $request->remember_me,
            ],
        ]);
    }

    // ─── Refresh Token ───────────────────────────────────────────────────────

    public function refresh(Request $request): JsonResponse
    {
        $request->validate([
            'refresh_token' => ['required', 'string'],
        ]);

        $tokens = $this->tokenService->refreshAccessToken(
            $request->refresh_token,
            $request
        );

        if (!$tokens) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired refresh token. Please log in again.',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Token refreshed',
            'data' => ['tokens' => $tokens],
        ]);
    }

    // ─── Logout ──────────────────────────────────────────────────────────────

    public function logout(Request $request): JsonResponse
    {
        $this->tokenService->revokeAllTokens($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    // ─── Get Authenticated User ───────────────────────────────────────────────

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => ['user' => $this->formatUser($request->user())],
        ]);
    }

    // ─── Forgot Password ─────────────────────────────────────────────────────

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        $otp = $this->otpService->generate($request->email, 'password_reset');
        $this->otpService->sendEmail($request->email, $otp, 'password_reset');

        return response()->json([
            'success' => true,
            'message' => 'Password reset OTP has been sent to your email.',
        ]);
    }

    // ─── Verify Password Reset OTP ───────────────────────────────────────────

    public function verifyPasswordResetOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $result = $this->otpService->verify($request->email, $request->otp, 'password_reset');

        if ($result !== 'valid') {
            $message = match ($result) {
                'expired' => 'OTP has expired. Please request a new one.',
                'used' => 'OTP has already been used.',
                default => 'Invalid OTP.',
            };
            return response()->json(['success' => false, 'message' => $message], 422);
        }

        // Generate a short-lived verification token for the reset step
        // We re-generate so the OTP is confirmed but we need a new token for next step
        $verifyToken = $this->otpService->generate($request->email, 'password_reset');
        // Don't send email — this is an internal token for the reset form
        // Store it in session or return it to frontend
        // Here we return it so the frontend can pass it in the reset step

        return response()->json([
            'success' => true,
            'message' => 'OTP verified. You may now reset your password.',
            'data' => [
                'email' => $request->email,
                'reset_token' => $verifyToken, // frontend uses this for next step
            ],
        ]);
    }

    // ─── Reset Password ──────────────────────────────────────────────────────

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $result = $this->otpService->verify($request->email, $request->otp, 'password_reset');

        if ($result !== 'valid') {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired reset token. Please start over.',
            ], 422);
        }

        $user = User::where('email', $request->email)->first();
        $user->update(['password' => $request->password]);

        // Revoke all existing tokens for security
        $this->tokenService->revokeAllTokens($user);

        return response()->json([
            'success' => true,
            'message' => 'Password reset successful. Please log in with your new password.',
        ]);
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'phone_number' => $user->phone_number,
            'email_verified' => $user->isEmailVerified(),
            'avatar' => strtoupper(
                collect(explode(' ', $user->name))
                    ->map(fn($n) => $n[0] ?? '')
                    ->take(2)
                    ->join('')
            ),
            'created_at' => $user->created_at,
        ];
    }
}