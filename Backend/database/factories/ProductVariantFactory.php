<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductVariantFactory extends Factory
{
    protected $model = ProductVariant::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'size' => fake()->randomElement(['500ml', '1L', '4L', '5L']),
            'price' => fake()->randomFloat(2, 100, 5000),
            'shop_stock' => fake()->numberBetween(0, 50),
            'online_stock' => fake()->numberBetween(0, 50),
        ];
    }
}