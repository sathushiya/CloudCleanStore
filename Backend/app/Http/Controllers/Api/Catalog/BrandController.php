<?php

namespace App\Http\Controllers\Api\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\StoreBrandRequest;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;

class BrandController extends Controller
{
    public function index(): JsonResponse
    {
        $brands = Brand::where('is_active', true)->orderBy('name')->get();
        return response()->json(['success' => true, 'data' => $brands]);
    }

    public function adminIndex(): JsonResponse
    {
        $brands = Brand::withCount('products')->orderBy('name')->get();
        return response()->json(['success' => true, 'data' => $brands]);
    }

    public function store(StoreBrandRequest $request): JsonResponse
    {
        $brand = Brand::create($request->validated());
        return response()->json(['success' => true, 'message' => 'Brand created successfully.', 'data' => $brand], 201);
    }

    public function update(StoreBrandRequest $request, Brand $brand): JsonResponse
    {
        $brand->update($request->validated());
        return response()->json(['success' => true, 'message' => 'Brand updated successfully.', 'data' => $brand]);
    }

    public function destroy(Brand $brand): JsonResponse
    {
        if ($brand->products()->exists()) {
            return response()->json(['success' => false, 'message' => 'Cannot delete a brand that still has products.'], 422);
        }

        $brand->delete();
        return response()->json(['success' => true, 'message' => 'Brand deleted successfully.']);
    }
}
