<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppCheckService
{
    public function check(string $phone): ?bool
    {
        $instanceId = config('services.green_api.instance_id');
        $token = config('services.green_api.token');

        if (!$instanceId || !$token) {
            Log::warning('WhatsApp check skipped: Green API not configured.');
            return null;
        }

        $cleanPhone = ltrim(preg_replace('/[^\d]/', '', $phone), '0');

        try {
            $response = Http::timeout(10)->post(
                "https://api.green-api.com/waInstance{$instanceId}/checkWhatsapp/{$token}",
                ['phoneNumber' => (int) $cleanPhone]
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
}