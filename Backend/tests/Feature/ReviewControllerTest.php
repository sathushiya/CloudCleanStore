<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_review_a_delivered_order(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $order = Order::factory()->create(['user_id' => $customer->id, 'status' => 'delivered']);

        $response = $this->actingAs($customer, 'sanctum')->postJson("/api/customer/orders/{$order->id}/review", [
            'rating' => 5,
            'comment' => 'Great products and fast delivery, will order again!',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('reviews', ['order_id' => $order->id, 'user_id' => $customer->id, 'rating' => 5]);
    }

    public function test_customer_cannot_review_an_order_that_is_not_delivered(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $order = Order::factory()->create(['user_id' => $customer->id, 'status' => 'processing']);

        $response = $this->actingAs($customer, 'sanctum')->postJson("/api/customer/orders/{$order->id}/review", [
            'rating' => 5,
            'comment' => 'Great products and fast delivery, will order again!',
        ]);

        $response->assertUnprocessable();
        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_customer_cannot_review_someone_elses_order(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $otherCustomer = User::factory()->create(['role' => 'customer']);
        $order = Order::factory()->create(['user_id' => $otherCustomer->id, 'status' => 'delivered']);

        $response = $this->actingAs($customer, 'sanctum')->postJson("/api/customer/orders/{$order->id}/review", [
            'rating' => 5,
            'comment' => 'Great products and fast delivery, will order again!',
        ]);

        $response->assertForbidden();
    }

    public function test_customer_cannot_review_the_same_order_twice(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $order = Order::factory()->create(['user_id' => $customer->id, 'status' => 'delivered']);
        Review::create(['user_id' => $customer->id, 'order_id' => $order->id, 'rating' => 4, 'comment' => 'Already reviewed this one before.']);

        $response = $this->actingAs($customer, 'sanctum')->postJson("/api/customer/orders/{$order->id}/review", [
            'rating' => 5,
            'comment' => 'Trying to review again, should not work.',
        ]);

        $response->assertUnprocessable();
        $this->assertDatabaseCount('reviews', 1);
    }

    public function test_review_requires_a_rating_between_1_and_5(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $order = Order::factory()->create(['user_id' => $customer->id, 'status' => 'delivered']);

        $response = $this->actingAs($customer, 'sanctum')->postJson("/api/customer/orders/{$order->id}/review", [
            'rating' => 6,
            'comment' => 'Great products and fast delivery, will order again!',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('rating');
    }

    public function test_public_reviews_endpoint_only_returns_high_rated_reviews(): void
    {
        $customer = User::factory()->create(['name' => 'Priya Fernando']);
        $order1 = Order::factory()->create(['user_id' => $customer->id, 'status' => 'delivered']);
        $order2 = Order::factory()->create(['user_id' => $customer->id, 'status' => 'delivered']);
        Review::create(['user_id' => $customer->id, 'order_id' => $order1->id, 'rating' => 5, 'comment' => 'Excellent service, highly recommend to everyone!']);
        Review::create(['user_id' => $customer->id, 'order_id' => $order2->id, 'rating' => 2, 'comment' => 'Not great, delivery was quite late for me.']);

        $response = $this->getJson('/api/reviews');

        $response->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Priya Fernando')
            ->assertJsonPath('data.0.rating', 5);
    }

    public function test_guest_cannot_submit_a_review(): void
    {
        $order = Order::factory()->create(['status' => 'delivered']);

        $response = $this->postJson("/api/customer/orders/{$order->id}/review", [
            'rating' => 5,
            'comment' => 'Great products and fast delivery, will order again!',
        ]);

        $response->assertUnauthorized();
    }
}
