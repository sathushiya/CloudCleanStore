<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedBrand('Dash', [
            ['name' => 'Carpet Shampoo', 'category' => 'floor', 'variants' => [
                ['size' => '4L', 'price' => 2950],
            ]],
            ['name' => 'Dash Glass Cleaner', 'category' => 'glass', 'variants' => [
                ['size' => '500ml', 'price' => 495],
                ['size' => '4L', 'price' => 2150],
            ]],
            ['name' => 'Dash Car Wash', 'category' => 'industrial', 'variants' => [
                ['size' => '1L', 'price' => 995],
            ]],
            ['name' => 'Dash Tile Cleaner (Acid Free)', 'category' => 'floor', 'variants' => [
                ['size' => '500ml', 'price' => 420],
                ['size' => '1L', 'price' => 820],
                ['size' => '4L', 'price' => 2915],
            ]],
            ['name' => 'Comox Fresh Toilet Bowl Cleaner', 'category' => 'bathroom', 'variants' => [
                ['size' => '200ml', 'price' => 230],
                ['size' => '500ml', 'price' => 430],
                ['size' => '4L', 'price' => 2100],
            ]],
            ['name' => 'Super Tile Cleaner (Calcium Remover)', 'category' => 'floor', 'variants' => [
                ['size' => '500ml', 'price' => 350],
                ['size' => '4L', 'price' => 1780],
            ]],
            ['name' => 'White Plush Liquid Bleach', 'category' => 'laundry', 'variants' => [
                ['size' => '500ml', 'price' => 370],
            ]],
            ['name' => 'Dash Disinfectant Pine', 'category' => 'industrial', 'variants' => [
                ['size' => '1L', 'price' => 430],
                ['size' => '4L', 'price' => 1760],
            ]],
            ['name' => 'Dash Disinfectant Lavender', 'category' => 'industrial', 'variants' => [
                ['size' => '1L', 'price' => 430],
                ['size' => '4L', 'price' => 1760],
            ]],
            ['name' => 'Dash Gliz Dish Wash Powder', 'category' => 'kitchen', 'variants' => [
                ['size' => '500g', 'price' => 380],
            ]],
            ['name' => 'Dash Gliz Wash Liquid Lime', 'category' => 'kitchen', 'variants' => [
                ['size' => '500ml', 'price' => 420],
            ]],
            ['name' => 'Dash Gliz Dish Wash Bar', 'category' => 'kitchen', 'variants' => [
                ['size' => '100g', 'price' => 65],
            ]],
            ['name' => 'Dash Care Laundry Liquid', 'category' => 'laundry', 'variants' => [
                ['size' => '1L', 'price' => 785],
            ]],
            ['name' => 'Dash Super Detergent Powder', 'category' => 'laundry', 'variants' => [
                ['size' => '1Kg', 'price' => 375],
            ]],
            ['name' => 'Spring Time Air Freshener Spray Cinnamon', 'category' => 'industrial', 'variants' => [
                ['size' => '500ml', 'price' => 860],
            ]],
        ]);

        $this->seedBrand('Clena', [
            ['name' => 'Carpet Shampoo', 'category' => 'floor', 'variants' => [
                ['size' => '5L', 'price' => 2300],
            ]],
            ['name' => 'Tile Cleaner', 'category' => 'floor', 'variants' => [
                ['size' => '5L', 'price' => 1610],
                ['size' => '1L', 'price' => 650],
            ]],
            ['name' => 'Magic Brush Tile Cleaner', 'category' => 'floor', 'variants' => [
                ['size' => '5L', 'price' => 2300],
                ['size' => '1L', 'price' => 720],
            ]],
            ['name' => 'All Purpose Liquid Detergent', 'category' => 'industrial', 'variants' => [
                ['size' => '5L', 'price' => 1600],
                ['size' => '1L', 'price' => 520],
            ]],
            ['name' => 'Power Bleach', 'category' => 'laundry', 'variants' => [
                ['size' => '5L', 'price' => 1780],
                ['size' => '1L', 'price' => 520],
            ]],
            ['name' => 'Floral Surface Disinfectant', 'category' => 'industrial', 'variants' => [
                ['size' => '5L', 'price' => 1780],
                ['size' => '1L', 'price' => 610],
            ]],
            ['name' => 'Glass Cleaner', 'category' => 'glass', 'variants' => [
                ['size' => '5L', 'price' => 1600],
                ['size' => '1L', 'price' => 520],
            ]],
            ['name' => 'Toilet Bowl Cleaner', 'category' => 'bathroom', 'variants' => [
                ['size' => '5L', 'price' => 1780],
                ['size' => '1L', 'price' => 440],
            ]],
            ['name' => 'Wood Shine', 'category' => 'floor', 'variants' => [
                ['size' => '5L', 'price' => 5510],
                ['size' => '1L', 'price' => 1080],
            ]],
            ['name' => 'Discovery Detergent (Laundry Liquid)', 'category' => 'laundry', 'variants' => [
                ['size' => '5L', 'price' => 4300],
                ['size' => '1L', 'price' => 790],
            ]],
            ['name' => 'Ink Remover', 'category' => 'industrial', 'variants' => [
                ['size' => '500ml', 'price' => 3830],
            ]],
            ['name' => 'Rust Remover', 'category' => 'industrial', 'variants' => [
                ['size' => '500ml', 'price' => 4760],
            ]],
            ['name' => 'Emulsifier 2000', 'category' => 'industrial', 'variants' => [
                ['size' => '5L', 'price' => 3250],
            ]],
            ['name' => 'Perfume', 'category' => 'industrial', 'variants' => [
                ['size' => '500ml', 'price' => 6040],
            ]],
        ]);
    }

    private function seedBrand(string $brandName, array $products): void
    {
        $brand = Brand::firstOrCreate(['name' => $brandName]);

        foreach ($products as $productData) {
            $product = Product::updateOrCreate(
                ['brand_id' => $brand->id, 'name' => $productData['name']],
                [
                    'category' => $productData['category'],
                    // No image yet — will be added via the Cloudinary upload once
                    // photos are available. Placeholder stays null until then.
                    'image' => null,
                    'is_active' => true,
                ]
            );

            foreach ($productData['variants'] as $variant) {
                $product->variants()->updateOrCreate(
                    ['size' => $variant['size']],
                    [
                        'price' => $variant['price'],
                        // Reasonable starting stock — adjust for real counts once known
                        'shop_stock' => 20,
                        'online_stock' => 30,
                    ]
                );
            }
        }
    }
}
