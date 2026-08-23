<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
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

    public function test_checkout_rejects_a_cart_that_now_exceeds_stock(): void
    {
        // Simulates stock dropping between "added to cart" and "checked out"
        // (e.g. someone else's checkout ran in between) -- the cart-level
        // check in CartController can't catch this, only the re-check
        // inside checkout's own transaction can.
        $customer = User::factory()->create(['role' => 'customer']);
        $variant = ProductVariant::factory()->create(['online_stock' => 5]);
        CartItem::create(['user_id' => $customer->id, 'product_variant_id' => $variant->id, 'quantity' => 5]);
        $variant->update(['online_stock' => 1]);

        $response = $this->actingAs($customer, 'sanctum')->postJson('/api/customer/orders/checkout', [
            'delivery_address' => '123 Main St',
        ]);

        $response->assertUnprocessable();
        $this->assertDatabaseCount('orders', 0);
        // Cart is untouched -- nothing was decremented, nothing was cleared.
        $this->assertDatabaseHas('cart_items', ['user_id' => $customer->id, 'quantity' => 5]);
        $this->assertDatabaseHas('product_variants', ['id' => $variant->id, 'online_stock' => 1]);
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

    // ─── Two staff can't both claim the same order ─────────────────────────

    public function test_a_second_staff_member_cannot_claim_an_already_assigned_order(): void
    {
        $firstStaff = User::factory()->create(['role' => 'staff']);
        $secondStaff = User::factory()->create(['role' => 'staff']);
        $order = Order::factory()->create(['assigned_to' => null]);

        // Simulates the first staff member's request landing first.
        $this->actingAs($firstStaff, 'sanctum')->patchJson("/api/staff/orders/{$order->id}/assign")->assertOk();

        $response = $this->actingAs($secondStaff, 'sanctum')->patchJson("/api/staff/orders/{$order->id}/assign");

        $response->assertStatus(409);
        // The order still belongs to whoever got there first, unchanged.
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'assigned_to' => $firstStaff->id]);
    }

    public function test_supervisor_cannot_assign_an_already_assigned_order_to_someone_else(): void
    {
        $supervisor = User::factory()->create(['role' => 'staffsupervisor']);
        $alreadyAssigned = User::factory()->create(['role' => 'staff']);
        $anotherStaff = User::factory()->create(['role' => 'staff']);
        $order = Order::factory()->create(['assigned_to' => $alreadyAssigned->id]);

        $response = $this->actingAs($supervisor, 'sanctum')->patchJson(
            "/api/staff/orders/{$order->id}/assign",
            ['staff_id' => $anotherStaff->id]
        );

        $response->assertStatus(409);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'assigned_to' => $alreadyAssigned->id]);
    }

    // ─── Bank transfer orders aren't offered/assignable until paid ────────

    public function test_available_only_hides_an_unconfirmed_bank_transfer_order(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        Order::factory()->create(['status' => 'pending', 'payment_method' => 'bank_transfer', 'payment_status' => 'submitted']);
        $cashOrder = Order::factory()->create(['status' => 'pending', 'payment_method' => 'cash']);

        $response = $this->actingAs($staff, 'sanctum')->getJson('/api/staff/orders?status=pending&available_only=1');

        $response->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $cashOrder->id);
    }

    public function test_available_only_includes_a_confirmed_bank_transfer_order(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $order = Order::factory()->create(['status' => 'pending', 'payment_method' => 'bank_transfer', 'payment_status' => 'confirmed']);

        $response = $this->actingAs($staff, 'sanctum')->getJson('/api/staff/orders?status=pending&available_only=1');

        $response->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $order->id);
    }

    public function test_staff_cannot_accept_an_unconfirmed_bank_transfer_order(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $order = Order::factory()->create([
            'assigned_to' => null,
            'payment_method' => 'bank_transfer',
            'payment_status' => 'submitted',
        ]);

        $response = $this->actingAs($staff, 'sanctum')->patchJson("/api/staff/orders/{$order->id}/assign");

        $response->assertUnprocessable();
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'assigned_to' => null]);
    }

    public function test_staff_can_accept_a_confirmed_bank_transfer_order(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $order = Order::factory()->create([
            'assigned_to' => null,
            'payment_method' => 'bank_transfer',
            'payment_status' => 'confirmed',
        ]);

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

    // ─── Order status state machine ────────────────────────────────────────

    public function test_a_delivered_order_cannot_be_moved_back_to_pending(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $order = Order::factory()->create(['status' => 'delivered']);

        $response = $this->actingAs($staff, 'sanctum')->patchJson("/api/staff/orders/{$order->id}/status", [
            'status' => 'pending',
        ]);

        $response->assertUnprocessable();
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'delivered']);
    }

    public function test_a_pending_order_cannot_skip_straight_to_delivered(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $order = Order::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($staff, 'sanctum')->patchJson("/api/staff/orders/{$order->id}/status", [
            'status' => 'delivered',
        ]);

        $response->assertUnprocessable();
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'pending']);
    }

    public function test_a_cancelled_order_cannot_be_reactivated(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $order = Order::factory()->create(['status' => 'cancelled']);

        $response = $this->actingAs($staff, 'sanctum')->patchJson("/api/staff/orders/{$order->id}/status", [
            'status' => 'processing',
        ]);

        $response->assertUnprocessable();
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'cancelled']);
    }

    // ─── Cancelling returns the reserved stock ─────────────────────────────

    public function test_cancelling_an_order_restocks_its_items(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $variant = ProductVariant::factory()->create(['online_stock' => 3]);
        $order = Order::factory()->create(['status' => 'processing']);
        OrderItem::create([
            'order_id' => $order->id,
            'product_variant_id' => $variant->id,
            'product_name' => 'Test Product',
            'variant_size' => '500ml',
            'price' => 100,
            'quantity' => 2,
        ]);

        $response = $this->actingAs($staff, 'sanctum')->patchJson("/api/staff/orders/{$order->id}/status", [
            'status' => 'cancelled',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('product_variants', ['id' => $variant->id, 'online_stock' => 5]);
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

    // ─── WhatsApp payment updates ──────────────────────────────────────────
    // The bank transfer page tells the customer they'll be messaged on
    // WhatsApp for verification -- these confirm that's actually true now.

    public function test_submitting_payment_notifies_the_customer_on_whatsapp(): void
    {
        config(['services.green_api.instance_id' => 'test-instance', 'services.green_api.token' => 'test-token']);
        Http::fake(['api.green-api.com/*/sendMessage/*' => Http::response(['idMessage' => 'abc'])]);

        $customer = User::factory()->create(['phone_number' => '+94771234567']);
        $order = Order::factory()->create(['user_id' => $customer->id, 'payment_method' => 'bank_transfer']);

        $response = $this->actingAs($customer, 'sanctum')->postJson("/api/customer/orders/{$order->id}/submit-payment", [
            'payment_reference' => 'REF123',
        ]);

        $response->assertOk();
        Http::assertSent(function ($request) use ($order) {
            return str_contains($request->url(), 'sendMessage')
                && $request['chatId'] === '94771234567@c.us'
                && str_contains($request['message'], $order->order_number);
        });
    }

    public function test_confirming_payment_notifies_the_customer_it_was_approved(): void
    {
        config(['services.green_api.instance_id' => 'test-instance', 'services.green_api.token' => 'test-token']);
        Http::fake(['api.green-api.com/*/sendMessage/*' => Http::response(['idMessage' => 'abc'])]);

        $customer = User::factory()->create(['phone_number' => '+94771234567']);
        $staff = User::factory()->create(['role' => 'staffsupervisor']);
        $order = Order::factory()->create(['user_id' => $customer->id, 'payment_status' => 'submitted']);

        $response = $this->actingAs($staff, 'sanctum')->patchJson("/api/staff/orders/{$order->id}/confirm-payment", [
            'approved' => true,
        ]);

        $response->assertOk();
        Http::assertSent(fn ($request) => str_contains($request->url(), 'sendMessage')
            && str_contains($request['message'], 'confirmed'));
    }

    public function test_rejecting_payment_notifies_the_customer_it_was_rejected(): void
    {
        config(['services.green_api.instance_id' => 'test-instance', 'services.green_api.token' => 'test-token']);
        Http::fake(['api.green-api.com/*/sendMessage/*' => Http::response(['idMessage' => 'abc'])]);

        $customer = User::factory()->create(['phone_number' => '+94771234567']);
        $staff = User::factory()->create(['role' => 'staffsupervisor']);
        $order = Order::factory()->create(['user_id' => $customer->id, 'payment_status' => 'submitted']);

        $response = $this->actingAs($staff, 'sanctum')->patchJson("/api/staff/orders/{$order->id}/confirm-payment", [
            'approved' => false,
        ]);

        $response->assertOk();
        Http::assertSent(fn ($request) => str_contains($request->url(), 'sendMessage')
            && str_contains($request['message'], "couldn't verify"));
    }

    public function test_payment_update_does_not_fail_when_customer_has_no_phone(): void
    {
        $customer = User::factory()->create(['phone_number' => null]);
        $order = Order::factory()->create(['user_id' => $customer->id, 'payment_method' => 'bank_transfer']);

        $response = $this->actingAs($customer, 'sanctum')->postJson("/api/customer/orders/{$order->id}/submit-payment", [
            'payment_reference' => 'REF123',
        ]);

        $response->assertOk();
    }

    // ─── assigned_to must stay a plain integer ─────────────────────────────
    // Regression: the assignedTo() relation used to serialize under the JSON
    // key "assigned_to" (Eloquent snake_cases the relation method name),
    // silently overwriting the real assigned_to column -- a plain FK int --
    // with a full User object wherever the relation was eager-loaded. The
    // frontend compared order.assigned_to === user.id and always got false,
    // so "My Deliveries" showed empty for every staff member. Renamed the
    // relation to assignedStaff() to fix it; this test pins the JSON shape
    // so it can't quietly regress the same way again.

    public function test_assigned_to_stays_a_plain_integer_when_the_relation_is_eager_loaded(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $order = Order::factory()->create(['assigned_to' => $staff->id, 'status' => 'processing']);

        $response = $this->actingAs($staff, 'sanctum')->getJson('/api/staff/orders');

        $response->assertOk();
        $returned = collect($response->json('data'))->firstWhere('id', $order->id);
        $this->assertSame($staff->id, $returned['assigned_to']);
    }

    public function test_an_order_assigned_to_someone_else_has_a_distinct_integer_id(): void
    {
        $me = User::factory()->create(['role' => 'staff']);
        $someoneElse = User::factory()->create(['role' => 'staff']);
        $order = Order::factory()->create(['assigned_to' => $someoneElse->id, 'status' => 'processing']);

        $response = $this->actingAs($me, 'sanctum')->getJson('/api/staff/orders');
        $returned = collect($response->json('data'))->firstWhere('id', $order->id);

        // Confirms the comparison StaffDashboard.tsx does client-side
        // (order.assigned_to === my id) would correctly exclude this order
        // from "My Deliveries" -- both sides are plain integers, and they
        // genuinely differ.
        $this->assertIsInt($returned['assigned_to']);
        $this->assertNotSame($me->id, $returned['assigned_to']);
        $this->assertSame($someoneElse->id, $returned['assigned_to']);
    }
}