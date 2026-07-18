<?php

namespace App\Http\Controllers\Api\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\AddCartItemRequest;
use App\Models\CartItem;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = $request->user()->cartItems()->with(['variant.product.brand'])->get();

        return response()->json([
            'success' => true,
            'data' => [
                'items' => $items,
                'total' => $items->sum(fn (CartItem $item) => $item->variant->price * $item->quantity),
            ],
        ]);
    }

    public function store(AddCartItemRequest $request): JsonResponse
    {
        $variant = ProductVariant::findOrFail($request->product_variant_id);

        $item = CartItem::updateOrCreate(
            ['user_id' => $request->user()->id, 'product_variant_id' => $variant->id],
            []
        );

        $item->quantity = $item->wasRecentlyCreated ? $request->quantity : $item->quantity + $request->quantity;
        $item->save();

        return response()->json(['success' => true, 'message' => 'Item added to cart.', 'data' => $item->load('variant.product')], 201);
    }

    public function update(Request $request, CartItem $cartItem): JsonResponse
    {
        $this->authorizeOwner($request, $cartItem);
        $request->validate(['quantity' => ['required', 'integer', 'min:1']]);
        $cartItem->update(['quantity' => $request->quantity]);

        return response()->json(['success' => true, 'message' => 'Cart item updated.', 'data' => $cartItem]);
    }

    public function destroy(Request $request, CartItem $cartItem): JsonResponse
    {
        $this->authorizeOwner($request, $cartItem);
        $cartItem->delete();

        return response()->json(['success' => true, 'message' => 'Item removed from cart.']);
    }

    public function clear(Request $request): JsonResponse
    {
        $request->user()->cartItems()->delete();
        return response()->json(['success' => true, 'message' => 'Cart cleared.']);
    }

    private function authorizeOwner(Request $request, CartItem $cartItem): void
    {
        abort_if($cartItem->user_id !== $request->user()->id, 403, 'This cart item does not belong to you.');
    }
}
