<?php

namespace App\Services;

use App\Models\OtpVerification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;

class OtpService
{
    /**
     * Generate a secure 6-digit OTP and store it in the database
     */
    public function generate(string $email, string $type): string
    {
        // Delete any old unused OTPs for this email + type
        OtpVerification::where('email', $email)
            ->where('type', $type)
            ->where('is_used', false)
            ->delete();

        // Generate cryptographically secure random 6-digit OTP
        $otp = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

        // Store in database
        OtpVerification::create([
            'email' => $email,
            'otp' => $otp,
            'type' => $type,
            'is_used' => false,
            'expires_at' => Carbon::now()->addMinutes(
                (int) env('OTP_EXPIRY_MINUTES', 10)
            ),
        ]);

        return $otp;
    }

    /**
     * Verify OTP from the database
     * Returns: 'valid' | 'invalid' | 'expired' | 'used'
     */
    public function verify(string $email, string $otp, string $type): string
    {
        $record = OtpVerification::where('email', $email)
            ->where('type', $type)
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$record) {
            return 'invalid';
        }

        if ($record->is_used) {
            return 'used';
        }

        if ($record->isExpired()) {
            return 'expired';
        }

        if ($record->otp !== $otp) {
            return 'invalid';
        }

        // Mark as used
        $record->update(['is_used' => true]);

        return 'valid';
    }

    /**
     * Send OTP via email
     */
    public function sendEmail(string $email, string $otp, string $type): void
    {
        Mail::to($email)->send(new OtpMail($otp, $type));
    }
}