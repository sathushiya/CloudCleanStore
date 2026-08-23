<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class StaffControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_cannot_list_staff(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($customer, 'sanctum')->getJson('/api/admin/staff');

        $response->assertForbidden();
    }

    public function test_admin_can_list_staff_accounts(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->create(['role' => 'staff']);
        User::factory()->create(['role' => 'staffsupervisor']);
        User::factory()->create(['role' => 'customer']); // should still show since index() lists admin+staff+staffsupervisor

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/staff');

        $response->assertOk();
        // admin (self) + staff + staffsupervisor = 3, customer excluded
        $this->assertCount(3, $response->json('data'));
    }

    public function test_admin_can_create_a_staff_account_with_password(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/staff', [
            'name' => 'New Staff',
            'email' => 'newstaff@example.com',
            'role' => 'staff',
            'password' => 'SecurePass123!',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('users', ['email' => 'newstaff@example.com', 'role' => 'staff']);

        $created = User::where('email', 'newstaff@example.com')->first();
        $this->assertTrue(Hash::check('SecurePass123!', $created->password));
        // Admin-created accounts skip OTP -- should be immediately verified
        $this->assertNotNull($created->email_verified_at);
    }

    public function test_creating_staff_without_password_fails(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/staff', [
            'name' => 'No Password Staff',
            'email' => 'nopass@example.com',
            'role' => 'staff',
        ]);

        $response->assertUnprocessable();
    }

    public function test_updating_staff_does_not_require_password(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $staff = User::factory()->create(['role' => 'staff', 'name' => 'Old Name']);

        $response = $this->actingAs($admin, 'sanctum')->putJson("/api/admin/staff/{$staff->id}", [
            'name' => 'Updated Name',
            'email' => $staff->email,
            'role' => 'staff',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('users', ['id' => $staff->id, 'name' => 'Updated Name']);
    }

    public function test_admin_cannot_delete_own_account(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/admin/staff/{$admin->id}");

        $response->assertUnprocessable();
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_admin_can_delete_another_staff_account(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $staff = User::factory()->create(['role' => 'staff']);

        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/admin/staff/{$staff->id}");

        $response->assertOk();
        $this->assertSoftDeleted('users', ['id' => $staff->id]);
    }

    public function test_customer_cannot_view_staff_performance(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($customer, 'sanctum')->getJson('/api/admin/staff/performance');

        $response->assertForbidden();
    }

    public function test_admin_can_view_staff_performance_with_real_order_counts(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $staff = User::factory()->create(['role' => 'staff', 'name' => 'Top Performer']);

        // 2 delivered orders assigned to this staff member -- should count.
        Order::factory()->count(2)->create(['assigned_to' => $staff->id, 'status' => 'delivered']);
        // A pending order assigned to them -- should NOT count as completed.
        Order::factory()->create(['assigned_to' => $staff->id, 'status' => 'pending']);
        // A delivered order assigned to nobody -- should not affect anyone's count.
        Order::factory()->create(['assigned_to' => null, 'status' => 'delivered']);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/staff/performance');

        $response->assertOk();
        $data = collect($response->json('data'));
        $entry = $data->firstWhere('id', $staff->id);
        $this->assertNotNull($entry);
        $this->assertEquals(2, $entry['tasks_completed']);
    }
}