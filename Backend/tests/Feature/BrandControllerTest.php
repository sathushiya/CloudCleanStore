<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BrandControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_index_only_shows_active_brands(): void
    {
        Brand::factory()->create(['name' => 'Active Brand', 'is_active' => true]);
        Brand::factory()->create(['name' => 'Inactive Brand', 'is_active' => false]);

        $response = $this->getJson('/api/brands');

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('name');
        $this->assertTrue($names->contains('Active Brand'));
        $this->assertFalse($names->contains('Inactive Brand'));
    }

    public function test_admin_index_shows_inactive_brands_too(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Brand::factory()->create(['name' => 'Inactive Brand', 'is_active' => false]);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/brands');

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('name');
        $this->assertTrue($names->contains('Inactive Brand'));
    }

    public function test_customer_cannot_create_a_brand(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($customer, 'sanctum')->postJson('/api/admin/brands', [
            'name' => 'New Brand',
        ]);

        $response->assertForbidden();
    }

    public function test_admin_can_create_a_brand(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/brands', [
            'name' => 'Sparkle Co',
            'description' => 'Premium cleaning products',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('brands', ['name' => 'Sparkle Co']);
    }

    public function test_creating_a_brand_with_a_duplicate_name_fails(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Brand::factory()->create(['name' => 'Sparkle Co']);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/brands', [
            'name' => 'Sparkle Co',
        ]);

        $response->assertUnprocessable();
    }

    public function test_admin_can_update_a_brand_without_tripping_its_own_unique_name(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $brand = Brand::factory()->create(['name' => 'Sparkle Co']);

        $response = $this->actingAs($admin, 'sanctum')->putJson("/api/admin/brands/{$brand->id}", [
            'name' => 'Sparkle Co',
            'description' => 'Updated description',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('brands', ['id' => $brand->id, 'description' => 'Updated description']);
    }
}
