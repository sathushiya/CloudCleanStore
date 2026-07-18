<?php

namespace Database\Factories;

use App\Models\Brand;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'brand_id' => Brand::factory(),
            'name' => fake()->words(3, true),
            'category' => fake()->randomElement(['bathroom', 'floor', 'kitchen', 'glass', 'laundry', 'industrial']),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}