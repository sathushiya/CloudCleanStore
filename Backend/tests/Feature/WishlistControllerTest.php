<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\WishlistItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WishlistControllerTest extends TestCase
{
    use RefreshDatabase;

    private function productWithVariant(): Product
    {
        $product = Product::factory()->create();
        ProductVariant::factory()->create(['product_id' => $product->id]);
        return $product;
    }

    public function test_guest_cannot_access_wishlist(): void
    {
        $response = $this->getJson('/api/customer/wishlist');

        $response->assertUnauthorized();
    }

    public function test_customer_can_list_their_own_wishlist(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $product = $this->productWithVariant();
        WishlistItem::factory()->create(['user_id' => $customer->id, 'product_id' => $product->id]);
        WishlistItem::factory()->create(); // someone else's -- should not appear

        $response = $this->actingAs($customer, 'sanctum')->getJson('/api/customer/wishlist');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_customer_can_add_a_product_to_their_wishlist(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $product = $this->productWithVariant();

        $response = $this->actingAs($customer, 'sanctum')->postJson('/api/customer/wishlist', [
            'product_id' => $product->id,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('wishlist_items', ['user_id' => $customer->id, 'product_id' => $product->id]);
    }

    public function test_adding_the_same_product_twice_does_not_duplicate_the_row(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $product = $this->productWithVariant();

        $this->actingAs($customer, 'sanctum')->postJson('/api/customer/wishlist', ['product_id' => $product->id]);
        $this->actingAs($customer, 'sanctum')->postJson('/api/customer/wishlist', ['product_id' => $product->id]);

        $this->assertEquals(
            1,
            WishlistItem::where('user_id', $customer->id)->where('product_id', $product->id)->count()
        );
    }

    public function test_adding_a_nonexistent_product_fails_validation(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($customer, 'sanctum')->postJson('/api/customer/wishlist', [
            'product_id' => 999999,
        ]);

        $response->assertUnprocessable();
    }

    public function test_customer_can_remove_a_product_from_their_own_wishlist(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $product = $this->productWithVariant();
        WishlistItem::factory()->create(['user_id' => $customer->id, 'product_id' => $product->id]);

        $response = $this->actingAs($customer, 'sanctum')->deleteJson("/api/customer/wishlist/{$product->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('wishlist_items', ['user_id' => $customer->id, 'product_id' => $product->id]);
    }

    public function test_removing_a_product_does_not_affect_another_customers_wishlist(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $otherCustomer = User::factory()->create(['role' => 'customer']);
        $product = $this->productWithVariant();
        WishlistItem::factory()->create(['user_id' => $otherCustomer->id, 'product_id' => $product->id]);

        $response = $this->actingAs($customer, 'sanctum')->deleteJson("/api/customer/wishlist/{$product->id}");

        $response->assertOk();
        $this->assertDatabaseHas('wishlist_items', ['user_id' => $otherCustomer->id, 'product_id' => $product->id]);
    }
}
