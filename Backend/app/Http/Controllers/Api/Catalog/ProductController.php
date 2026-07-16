<?php

namespace App\Http\Controllers\Api\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\StoreProductRequest;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['brand', 'variants'])->where('is_active', true);

        if ($request->filled('category')) $query->where('category', $request->string('category'));
        if ($request->filled('brand_id')) $query->where('brand_id', $request->integer('brand_id'));
        if ($request->filled('search')) $query->where('name', 'like', '%' . $request->string('search') . '%');

        $products = $query->orderByDesc('created_at')->paginate(100);
        return response()->json(['success' => true, 'data' => $products]);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load(['brand', 'variants']);
        return response()->json(['success' => true, 'data' => $product]);
    }

    public function adminIndex(): JsonResponse
    {
        $products = Product::with(['brand', 'variants'])->orderByDesc('created_at')->get();
        return response()->json(['success' => true, 'data' => $products]);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $product = Product::create(collect($validated)->except('variants')->toArray());

        foreach ($validated['variants'] as $variant) {
            $product->variants()->create($variant);
        }

        return response()->json(['success' => true, 'message' => 'Product created successfully.', 'data' => $product->load(['brand', 'variants'])], 201);
    }

    public function update(StoreProductRequest $request, Product $product): JsonResponse
    {
        $validated = $request->validated();
        $product->update(collect($validated)->except('variants')->toArray());

        $product->variants()->delete();
        foreach ($validated['variants'] as $variant) {
            $product->variants()->create($variant);
        }

        return response()->json(['success' => true, 'message' => 'Product updated successfully.', 'data' => $product->load(['brand', 'variants'])]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();
        return response()->json(['success' => true, 'message' => 'Product deleted successfully.']);
    }

    public function updateVariantStock(Request $request, \App\Models\ProductVariant $variant): JsonResponse
    {
        $request->validate([
            'shop_stock' => ['sometimes', 'integer', 'min:0'],
            'online_stock' => ['sometimes', 'integer', 'min:0'],
        ]);

        $variant->update($request->only(['shop_stock', 'online_stock']));
        return response()->json(['success' => true, 'message' => 'Stock updated successfully.', 'data' => $variant]);
    }
}