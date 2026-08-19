<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProfileControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_profile(): void
    {
        $response = $this->getJson('/api/profile');

        $response->assertUnauthorized();
    }

    public function test_authenticated_user_can_view_their_profile(): void
    {
        $user = User::factory()->create(['name' => 'Jane Doe']);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/profile');

        $response->assertOk()->assertJsonPath('data.name', 'Jane Doe');
    }

    public function test_user_can_update_their_name(): void
    {
        $user = User::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($user, 'sanctum')->putJson('/api/profile', ['name' => 'New Name']);

        $response->assertOk();
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'New Name']);
    }

    public function test_user_can_update_notification_preferences(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->putJson('/api/profile/preferences', [
            'notify_push' => false,
            'notify_sms' => true,
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'notify_push' => false,
            'notify_sms' => true,
        ]);
    }

    public function test_user_can_change_their_password_with_correct_current_password(): void
    {
        $user = User::factory()->create(['password' => Hash::make('OldPass1!')]);

        $response = $this->actingAs($user, 'sanctum')->putJson('/api/profile/password', [
            'current_password' => 'OldPass1!',
            'new_password' => 'NewPass1!',
            'new_password_confirmation' => 'NewPass1!',
        ]);

        $response->assertOk();
        $this->assertTrue(Hash::check('NewPass1!', $user->fresh()->password));
    }

    public function test_password_change_fails_with_wrong_current_password(): void
    {
        $user = User::factory()->create(['password' => Hash::make('OldPass1!')]);

        $response = $this->actingAs($user, 'sanctum')->putJson('/api/profile/password', [
            'current_password' => 'WrongPass1!',
            'new_password' => 'NewPass1!',
            'new_password_confirmation' => 'NewPass1!',
        ]);

        $response->assertUnprocessable();
        $this->assertTrue(Hash::check('OldPass1!', $user->fresh()->password));
    }

    public function test_password_change_fails_when_confirmation_does_not_match(): void
    {
        $user = User::factory()->create(['password' => Hash::make('OldPass1!')]);

        $response = $this->actingAs($user, 'sanctum')->putJson('/api/profile/password', [
            'current_password' => 'OldPass1!',
            'new_password' => 'NewPass1!',
            'new_password_confirmation' => 'Mismatch1!',
        ]);

        $response->assertUnprocessable();
    }
}
