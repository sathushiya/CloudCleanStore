<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    /**
     * Check whether a phone number has WhatsApp.
     * Returns true/false, or null if Green API isn't configured or the
     * check failed -- callers should treat null as "unknown", never as "no".
     */
    public function check(string $phone): ?bool
    {
        if (!$this->configured()) {
            Log::warning('WhatsApp check skipped: Green API not configured.');
            return null;
        }

        try {
            $response = Http::timeout(10)->post(
                $this->endpoint('checkWhatsapp'),
                ['phoneNumber' => (int) $this->cleanPhone($phone)]
            );

            if (!$response->successful()) {
                return null;
            }

            return $response->json('existsWhatsapp');
        } catch (\Exception $e) {
            Log::error('WhatsApp check failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Send the OTP as a WhatsApp message. Returns true if the message was
     * (or, in local dev without Green API configured, would have been) sent;
     * false only when Green API is configured but actively rejected it --
     * that's the one case worth surfacing to the user as a real failure.
     */
    public function sendOtp(string $phone, string $otp): bool
    {
        if (!$this->configured()) {
            Log::info("[WhatsApp OTP - Green API not configured, logging instead] To: {$phone} | Code: {$otp}");
            return true;
        }

        try {
            $response = Http::timeout(10)->post($this->endpoint('sendMessage'), [
                'chatId' => $this->cleanPhone($phone) . '@c.us',
                'message' => "Your CloudCleanStore verification code is: {$otp}\n\nThis code expires in " . (int) env('OTP_EXPIRY_MINUTES', 10) . ' minutes.',
            ]);

            if (!$response->successful()) {
                Log::error('WhatsApp OTP send failed: ' . $response->body());
            }

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('WhatsApp OTP send failed: ' . $e->getMessage());
            return false;
        }
    }

    private function configured(): bool
    {
        return (bool) (config('services.green_api.instance_id') && config('services.green_api.token'));
    }

    private function endpoint(string $method): string
    {
        $instanceId = config('services.green_api.instance_id');
        $token = config('services.green_api.token');

        return "https://api.green-api.com/waInstance{$instanceId}/{$method}/{$token}";
    }

    private function cleanPhone(string $phone): string
    {
        return ltrim(preg_replace('/[^\d]/', '', $phone), '0');
    }
}
