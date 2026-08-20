<?php

namespace Tests\Feature;

use App\Models\OtpVerification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PhoneVerificationControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_send_otp(): void
    {
        $response = $this->postJson('/api/phone/send-otp', ['phone' => '+94771234567']);
        $response->assertUnauthorized();
    }

    public function test_send_otp_rejects_a_phone_without_country_code(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/phone/send-otp', [
            'phone' => '0771234567',
        ]);

        $response->assertUnprocessable();
    }

    public function test_send_otp_creates_a_pending_otp_record(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/phone/send-otp', [
            'phone' => '+94771234567',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('otp_verifications', [
            'phone' => '+94771234567',
            'type' => 'phone_verification',
            'is_used' => false,
        ]);
    }

    public function test_verify_otp_with_correct_code_marks_phone_verified(): void
    {
        $user = User::factory()->create();

        OtpVerification::create([
            'phone' => '+94771234567',
            'otp' => '123456',
            'type' => 'phone_verification',
            'is_used' => false,
            'expires_at' => now()->addMinutes(10),
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/phone/verify-otp', [
            'phone' => '+94771234567',
            'otp' => '123456',
        ]);

        $response->assertOk();
        $user->refresh();
        $this->assertNotNull($user->phone_verified_at);
        $this->assertEquals('+94771234567', $user->phone_number);
    }

    public function test_verify_otp_with_wrong_code_fails(): void
    {
        $user = User::factory()->create();

        OtpVerification::create([
            'phone' => '+94771234567',
            'otp' => '123456',
            'type' => 'phone_verification',
            'is_used' => false,
            'expires_at' => now()->addMinutes(10),
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/phone/verify-otp', [
            'phone' => '+94771234567',
            'otp' => '999999',
        ]);

        $response->assertUnprocessable();
        $this->assertNull($user->fresh()->phone_verified_at);
    }

    public function test_verify_otp_with_expired_code_fails(): void
    {
        $user = User::factory()->create();

        OtpVerification::create([
            'phone' => '+94771234567',
            'otp' => '123456',
            'type' => 'phone_verification',
            'is_used' => false,
            'expires_at' => now()->subMinute(), // already expired
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/phone/verify-otp', [
            'phone' => '+94771234567',
            'otp' => '123456',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonFragment(['message' => 'This code has expired. Please request a new one.']);
    }

    public function test_verify_otp_cannot_be_reused(): void
    {
        $user = User::factory()->create();

        OtpVerification::create([
            'phone' => '+94771234567',
            'otp' => '123456',
            'type' => 'phone_verification',
            'is_used' => false,
            'expires_at' => now()->addMinutes(10),
        ]);

        // First use succeeds
        $this->actingAs($user, 'sanctum')->postJson('/api/phone/verify-otp', [
            'phone' => '+94771234567',
            'otp' => '123456',
        ])->assertOk();

        // Second use of the same code fails
        $response = $this->actingAs($user, 'sanctum')->postJson('/api/phone/verify-otp', [
            'phone' => '+94771234567',
            'otp' => '123456',
        ]);

        $response->assertUnprocessable();
    }

    public function test_check_whatsapp_without_green_api_configured_returns_null_not_false(): void
    {
        $user = User::factory()->create();

        // No GREEN_API_* env vars set in the testing environment -- the
        // service should report "unknown" (null), never a false "no WhatsApp"
        $response = $this->actingAs($user, 'sanctum')->postJson('/api/phone/check-whatsapp', [
            'phone' => '+94771234567',
        ]);

        $response->assertOk();
        $this->assertNull($response->json('data.has_whatsapp'));
    }
}