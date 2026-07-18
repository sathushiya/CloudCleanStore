<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_fails_with_an_empty_cart(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($customer, 'sanctum')->postJson('/api/customer/orders/checkout', [
            'delivery_address' => '123 Main St',
        ]);

        $response->assertUnprocessable();
    }

    public function test_checkout_creates_an_order_and_clears_the_cart(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $variant = ProductVariant::factory()->create(['price' => 500, 'online_stock' => 10]);

        $this->actingAs($customer, 'sanctum')->postJson('/api/customer/cart', [
            'product_variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        $response = $this->actingAs($customer, 'sanctum')->postJson('/api/customer/orders/checkout', [
            'delivery_address' => '123 Main St, Colombo',
        ]);

        $response->assertCreated()->assertJsonPath('data.total', 1000);

        $this->assertDatabaseCount('cart_items', 0);
        $this->assertDatabaseHas('orders', ['user_id' => $customer->id, 'status' => 'pending', 'total' => 1000]);
    }

    public function test_checkout_decrements_online_stock(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $variant = ProductVariant::factory()->create(['online_stock' => 10]);

        $this->actingAs($customer, 'sanctum')->postJson('/api/customer/cart', [
            'product_variant_id' => $variant->id,
            'quantity' => 3,
        ]);
        $this->actingAs($customer, 'sanctum')->postJson('/api/customer/orders/checkout', [
            'delivery_address' => 'Test address',
        ]);

        $this->assertDatabaseHas('product_variants', ['id' => $variant->id, 'online_stock' => 7]);
    }

    public function test_customer_cannot_view_another_customers_order(): void
    {
        $customerA = User::factory()->create(['role' => 'customer']);
        $customerB = User::factory()->create(['role' => 'customer']);
        $order = Order::factory()->create(['user_id' => $customerA->id]);

        $response = $this->actingAs($customerB, 'sanctum')->getJson("/api/customer/orders/{$order->id}");

        $response->assertForbidden();
    }

    public function test_customer_cannot_access_staff_order_endpoints(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($customer, 'sanctum')->getJson('/api/staff/orders');

        $response->assertForbidden();
    }

    public function test_staff_and_staffsupervisor_are_equal_tier_and_can_both_manage_orders(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $supervisor = User::factory()->create(['role' => 'staffsupervisor']);
        Order::factory()->create();

        $this->actingAs($staff, 'sanctum')->getJson('/api/staff/orders')->assertOk();
        $this->actingAs($supervisor, 'sanctum')->getJson('/api/staff/orders')->assertOk();
    }

    public function test_staff_can_assign_an_order_to_self(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $order = Order::factory()->create(['assigned_to' => null]);

        $response = $this->actingAs($staff, 'sanctum')->patchJson("/api/staff/orders/{$order->id}/assign");

        $response->assertOk();
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'assigned_to' => $staff->id]);
    }

    public function test_staff_can_update_order_status(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $order = Order::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($staff, 'sanctum')->patchJson("/api/staff/orders/{$order->id}/status", [
            'status' => 'processing',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'processing']);
    }

    public function test_order_status_rejects_invalid_values(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $order = Order::factory()->create();

        $response = $this->actingAs($staff, 'sanctum')->patchJson("/api/staff/orders/{$order->id}/status", [
            'status' => 'not_a_real_status',
        ]);

        $response->assertUnprocessable();
    }
}