<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_anyone_can_browse_products_without_logging_in(): void
    {
        $product = Product::factory()->create();
        ProductVariant::factory()->create(['product_id' => $product->id]);

        $response = $this->getJson('/api/products');

        $response->assertOk()->assertJson(['success' => true]);
    }

    public function test_inactive_products_are_not_shown_publicly(): void
    {
        Product::factory()->create(['is_active' => false]);

        $response = $this->getJson('/api/products');

        $response->assertOk();
        $this->assertCount(0, $response->json('data.data'));
    }

    public function test_products_can_be_filtered_by_category(): void
    {
        Product::factory()->create(['category' => 'kitchen']);
        Product::factory()->create(['category' => 'bathroom']);

        $response = $this->getJson('/api/products?category=kitchen');

        $response->assertOk();
        $this->assertCount(1, $response->json('data.data'));
        $this->assertEquals('kitchen', $response->json('data.data.0.category'));
    }

    public function test_customer_cannot_create_a_product(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $brand = Brand::factory()->create();

        $response = $this->actingAs($customer, 'sanctum')->postJson('/api/admin/products', [
            'brand_id' => $brand->id,
            'name' => 'Test Product',
            'category' => 'kitchen',
            'variants' => [['size' => '500ml', 'price' => 100]],
        ]);

        $response->assertForbidden();
    }

    public function test_admin_can_create_a_product_with_variants(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $brand = Brand::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/products', [
            'brand_id' => $brand->id,
            'name' => 'Multi-Surface Spray',
            'category' => 'kitchen',
            'variants' => [
                ['size' => '500ml', 'price' => 450, 'shop_stock' => 10, 'online_stock' => 20],
            ],
        ]);

        $response->assertCreated()->assertJsonPath('data.name', 'Multi-Surface Spray');

        $this->assertDatabaseHas('products', ['name' => 'Multi-Surface Spray']);
        $this->assertDatabaseHas('product_variants', ['size' => '500ml', 'price' => 450]);
    }

    public function test_admin_cannot_create_a_product_without_variants(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $brand = Brand::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/products', [
            'brand_id' => $brand->id,
            'name' => 'No Variants Product',
            'category' => 'kitchen',
            'variants' => [],
        ]);

        $response->assertUnprocessable();
    }

    public function test_admin_can_delete_a_product(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $product = Product::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/admin/products/{$product->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_brand_with_products_cannot_be_deleted(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $brand = Brand::factory()->create();
        Product::factory()->create(['brand_id' => $brand->id]);

        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/admin/brands/{$brand->id}");

        $response->assertUnprocessable();
        $this->assertDatabaseHas('brands', ['id' => $brand->id]);
    }
}