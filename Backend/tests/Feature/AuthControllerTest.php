<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'Passw0rd!',
            'password_confirmation' => 'Passw0rd!',
            'phone_number' => '+94771234567',
        ], $overrides);
    }

    public function test_registration_requires_a_phone_number(): void
    {
        $payload = $this->validPayload();
        unset($payload['phone_number']);

        $response = $this->postJson('/api/auth/register', $payload);

        $response->assertUnprocessable()->assertJsonValidationErrors('phone_number');
    }

    public function test_registration_rejects_a_phone_without_country_code(): void
    {
        $response = $this->postJson('/api/auth/register', $this->validPayload(['phone_number' => '0771234567']));

        $response->assertUnprocessable();
        $this->assertDatabaseMissing('users', ['email' => 'jane@example.com']);
    }

    public function test_registration_succeeds_with_a_valid_phone_number(): void
    {
        $response = $this->postJson('/api/auth/register', $this->validPayload());

        $response->assertCreated();
        $this->assertDatabaseHas('users', ['email' => 'jane@example.com', 'phone_number' => '+94771234567']);
    }
}
