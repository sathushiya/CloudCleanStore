<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartControllerTest extends TestCase
{
    use RefreshDatabase;

    private function customer(): User
    {
        return User::factory()->create(['role' => 'customer']);
    }

    public function test_guest_cannot_access_cart(): void
    {
        $response = $this->getJson('/api/customer/cart');
        $response->assertUnauthorized();
    }

    public function test_customer_can_add_item_to_cart(): void
    {
        $customer = $this->customer();
        $variant = ProductVariant::factory()->create(['price' => 500, 'online_stock' => 100]);

        $response = $this->actingAs($customer, 'sanctum')->postJson('/api/customer/cart', [
            'product_variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('cart_items', [
            'user_id' => $customer->id,
            'product_variant_id' => $variant->id,
            'quantity' => 2,
        ]);
    }

    public function test_adding_the_same_variant_twice_increments_quantity_not_duplicates_row(): void
    {
        $customer = $this->customer();
        $variant = ProductVariant::factory()->create(['online_stock' => 100]);

        $this->actingAs($customer, 'sanctum')->postJson('/api/customer/cart', [
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);
        $this->actingAs($customer, 'sanctum')->postJson('/api/customer/cart', [
            'product_variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        $this->assertDatabaseCount('cart_items', 1);
        $this->assertDatabaseHas('cart_items', ['product_variant_id' => $variant->id, 'quantity' => 3]);
    }

    public function test_cart_total_is_calculated_correctly(): void
    {
        $customer = $this->customer();
        $variant = ProductVariant::factory()->create(['price' => 250, 'online_stock' => 100]);

        $this->actingAs($customer, 'sanctum')->postJson('/api/customer/cart', [
            'product_variant_id' => $variant->id,
            'quantity' => 3,
        ]);

        $response = $this->actingAs($customer, 'sanctum')->getJson('/api/customer/cart');

        $response->assertOk()->assertJsonPath('data.total', 750);
    }

    public function test_customer_cannot_modify_another_customers_cart_item(): void
    {
        $customerA = $this->customer();
        $customerB = $this->customer();
        $variant = ProductVariant::factory()->create(['online_stock' => 100]);

        $addResponse = $this->actingAs($customerA, 'sanctum')->postJson('/api/customer/cart', [
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);
        $cartItemId = $addResponse->json('data.id');

        $response = $this->actingAs($customerB, 'sanctum')->deleteJson("/api/customer/cart/{$cartItemId}");

        $response->assertForbidden();
    }

    // ─── Stock limits ───────────────────────────────────────────────────────

    public function test_cannot_add_more_than_available_stock(): void
    {
        $customer = $this->customer();
        $variant = ProductVariant::factory()->create(['online_stock' => 3]);

        $response = $this->actingAs($customer, 'sanctum')->postJson('/api/customer/cart', [
            'product_variant_id' => $variant->id,
            'quantity' => 4,
        ]);

        $response->assertUnprocessable();
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_adding_in_two_steps_cannot_exceed_stock_either(): void
    {
        $customer = $this->customer();
        $variant = ProductVariant::factory()->create(['online_stock' => 3]);

        $this->actingAs($customer, 'sanctum')->postJson('/api/customer/cart', [
            'product_variant_id' => $variant->id,
            'quantity' => 2,
        ])->assertCreated();

        // 2 already in cart + 2 more would be 4, over the limit of 3.
        $response = $this->actingAs($customer, 'sanctum')->postJson('/api/customer/cart', [
            'product_variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        $response->assertUnprocessable();
        $this->assertDatabaseHas('cart_items', ['product_variant_id' => $variant->id, 'quantity' => 2]);
    }

    public function test_cannot_update_cart_quantity_above_available_stock(): void
    {
        $customer = $this->customer();
        $variant = ProductVariant::factory()->create(['online_stock' => 3]);

        $addResponse = $this->actingAs($customer, 'sanctum')->postJson('/api/customer/cart', [
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);
        $cartItemId = $addResponse->json('data.id');

        $response = $this->actingAs($customer, 'sanctum')->patchJson("/api/customer/cart/{$cartItemId}", [
            'quantity' => 5,
        ]);

        $response->assertUnprocessable();
        $this->assertDatabaseHas('cart_items', ['id' => $cartItemId, 'quantity' => 1]);
    }

    public function test_customer_can_clear_entire_cart(): void
    {
        $customer = $this->customer();
        $variant1 = ProductVariant::factory()->create(['online_stock' => 100]);
        $variant2 = ProductVariant::factory()->create(['online_stock' => 100]);

        $this->actingAs($customer, 'sanctum')->postJson('/api/customer/cart', ['product_variant_id' => $variant1->id, 'quantity' => 1]);
        $this->actingAs($customer, 'sanctum')->postJson('/api/customer/cart', ['product_variant_id' => $variant2->id, 'quantity' => 1]);

        $response = $this->actingAs($customer, 'sanctum')->deleteJson('/api/customer/cart');

        $response->assertOk();
        $this->assertDatabaseCount('cart_items', 0);
    }
}