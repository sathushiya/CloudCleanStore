<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AddressControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_addresses(): void
    {
        $response = $this->getJson('/api/customer/addresses');

        $response->assertUnauthorized();
    }

    public function test_customer_can_list_their_own_addresses(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        Address::factory()->count(2)->create(['user_id' => $customer->id]);
        Address::factory()->create(); // someone else's -- should not appear

        $response = $this->actingAs($customer, 'sanctum')->getJson('/api/customer/addresses');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_first_address_is_automatically_made_default(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($customer, 'sanctum')->postJson('/api/customer/addresses', [
            'label' => 'Home',
            'street' => '123 Main St',
            'city' => 'Colombo',
            'state' => 'Western',
            'zip' => '00100',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('addresses', ['user_id' => $customer->id, 'is_default' => true]);
    }

    public function test_marking_a_new_address_default_unsets_the_previous_default(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $first = Address::factory()->create(['user_id' => $customer->id, 'is_default' => true]);

        $response = $this->actingAs($customer, 'sanctum')->postJson('/api/customer/addresses', [
            'label' => 'Work',
            'street' => '456 Office Rd',
            'city' => 'Colombo',
            'state' => 'Western',
            'zip' => '00200',
            'is_default' => true,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('addresses', ['id' => $first->id, 'is_default' => false]);
        $this->assertDatabaseHas('addresses', ['label' => 'Work', 'is_default' => true]);
    }

    public function test_customer_cannot_update_another_customers_address(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $otherAddress = Address::factory()->create();

        $response = $this->actingAs($customer, 'sanctum')->putJson("/api/customer/addresses/{$otherAddress->id}", [
            'label' => 'Hacked',
            'street' => '1 Nowhere',
            'city' => 'Colombo',
            'state' => 'Western',
            'zip' => '00100',
        ]);

        $response->assertForbidden();
    }

    public function test_customer_cannot_delete_another_customers_address(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $otherAddress = Address::factory()->create();

        $response = $this->actingAs($customer, 'sanctum')->deleteJson("/api/customer/addresses/{$otherAddress->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('addresses', ['id' => $otherAddress->id]);
    }

    public function test_deleting_the_default_address_promotes_another_to_default(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $default = Address::factory()->create(['user_id' => $customer->id, 'is_default' => true]);
        $other = Address::factory()->create(['user_id' => $customer->id, 'is_default' => false]);

        $response = $this->actingAs($customer, 'sanctum')->deleteJson("/api/customer/addresses/{$default->id}");

        $response->assertOk();
        $this->assertDatabaseHas('addresses', ['id' => $other->id, 'is_default' => true]);
    }
}
