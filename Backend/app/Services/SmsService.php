<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    public function sendOtp(string $phone, string $otp): void
    {
        $driver = env('SMS_DRIVER', 'log');

        if ($driver === 'twilio') {
            $this->sendViaTwilio($phone, $otp);
            return;
        }

        Log::info("[SMS OTP - log driver] To: {$phone} | Code: {$otp}");
    }

    private function sendViaTwilio(string $phone, string $otp): void
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $from = config('services.twilio.from');

        Http::withBasicAuth($sid, $token)
            ->asForm()
            ->post("https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json", [
                'From' => $from,
                'To' => $phone,
                'Body' => "Your CloudCleanStore verification code is: {$otp}",
            ]);
    }
}