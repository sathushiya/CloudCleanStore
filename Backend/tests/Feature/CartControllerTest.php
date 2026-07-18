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
        $variant = ProductVariant::factory()->create(['price' => 500]);

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
        $variant = ProductVariant::factory()->create();

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
        $variant = ProductVariant::factory()->create(['price' => 250]);

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
        $variant = ProductVariant::factory()->create();

        $addResponse = $this->actingAs($customerA, 'sanctum')->postJson('/api/customer/cart', [
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);
        $cartItemId = $addResponse->json('data.id');

        $response = $this->actingAs($customerB, 'sanctum')->deleteJson("/api/customer/cart/{$cartItemId}");

        $response->assertForbidden();
    }

    public function test_customer_can_clear_entire_cart(): void
    {
        $customer = $this->customer();
        $variant1 = ProductVariant::factory()->create();
        $variant2 = ProductVariant::factory()->create();

        $this->actingAs($customer, 'sanctum')->postJson('/api/customer/cart', ['product_variant_id' => $variant1->id, 'quantity' => 1]);
        $this->actingAs($customer, 'sanctum')->postJson('/api/customer/cart', ['product_variant_id' => $variant2->id, 'quantity' => 1]);

        $response = $this->actingAs($customer, 'sanctum')->deleteJson('/api/customer/cart');

        $response->assertOk();
        $this->assertDatabaseCount('cart_items', 0);
    }
}