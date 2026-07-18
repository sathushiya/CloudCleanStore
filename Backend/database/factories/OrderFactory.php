<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state(['role' => 'customer']),
            'order_number' => 'ORD-' . now()->format('Y') . '-' . strtoupper(Str::random(6)),
            'total' => fake()->randomFloat(2, 100, 10000),
            'status' => 'pending',
            'delivery_address' => fake()->address(),
        ];
    }
}