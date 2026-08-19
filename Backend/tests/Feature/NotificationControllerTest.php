<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_cannot_access_admin_notifications(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($customer, 'sanctum')->getJson('/api/admin/notifications');

        $response->assertForbidden();
    }

    public function test_admin_can_list_notifications(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Notification::log('order', 'New Order Received', 'Order #ORD-1 needs delivery assignment.', 'high');

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/notifications');

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_checkout_creates_a_notification(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $customer = User::factory()->create(['role' => 'customer']);
        $variant = ProductVariant::factory()->create(['online_stock' => 10]);

        $this->actingAs($customer, 'sanctum')->postJson('/api/customer/cart', [
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);
        $this->actingAs($customer, 'sanctum')->postJson('/api/customer/orders/checkout', [
            'delivery_address' => 'Test address',
        ]);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/notifications');

        $response->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.type', 'order')
            ->assertJsonPath('data.0.priority', 'high');
    }

    public function test_admin_can_mark_a_notification_as_read(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $notification = Notification::log('system', 'Test', 'Test message');

        $response = $this->actingAs($admin, 'sanctum')->patchJson("/api/admin/notifications/{$notification->id}/read");

        $response->assertOk();
        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_admin_can_mark_all_notifications_as_read(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Notification::log('system', 'One', 'One');
        Notification::log('system', 'Two', 'Two');

        $response = $this->actingAs($admin, 'sanctum')->patchJson('/api/admin/notifications/read-all');

        $response->assertOk();
        $this->assertDatabaseCount('notifications', 2);
        $this->assertSame(0, Notification::unread()->count());
    }

    public function test_admin_can_delete_a_notification(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $notification = Notification::log('system', 'Test', 'Test message');

        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/admin/notifications/{$notification->id}");

        $response->assertOk();
        $this->assertDatabaseCount('notifications', 0);
    }

    public function test_admin_can_clear_all_notifications(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Notification::log('system', 'One', 'One');
        Notification::log('system', 'Two', 'Two');

        $response = $this->actingAs($admin, 'sanctum')->deleteJson('/api/admin/notifications');

        $response->assertOk();
        $this->assertDatabaseCount('notifications', 0);
    }
}
