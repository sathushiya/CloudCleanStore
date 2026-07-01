<?php

namespace App\Services;

class PhoneService
{
    /**
     * Validate phone number format.
     * Accepts formats like:
     *   +94771234567 (Sri Lanka)
     *   +447911123456 (UK)
     *   +12025551234 (US)
     */
    public function validate(string $phone): array
    {
        $cleaned = preg_replace('/[\s\-\(\)]/', '', $phone);

        // Must start with + and have country code
        if (!preg_match('/^\+[1-9]\d{6,14}$/', $cleaned)) {
            return [
                'valid' => false,
                'message' => 'Phone number must include country code (e.g. +94771234567)',
                'formatted' => null,
            ];
        }

        return [
            'valid' => true,
            'message' => 'Valid phone number',
            'formatted' => $cleaned,
        ];
    }

    /**
     * Extract country code from phone number
     * Returns country code like '+94' or '+1'
     * 
     * NOTE: WhatsApp API integration will be added in future phase.
     * This method is prepared for that integration.
     */
    public function extractCountryCode(string $phone): ?string
    {
        $cleaned = preg_replace('/[\s\-\(\)]/', '', $phone);
        
        if (preg_match('/^(\+\d{1,3})/', $cleaned, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Format for WhatsApp API (future integration placeholder)
     * WhatsApp uses numbers without the '+' sign
     */
    public function formatForWhatsApp(string $phone): string
    {
        $cleaned = preg_replace('/[\s\-\(\)\+]/', '', $phone);
        return $cleaned;
    }
}