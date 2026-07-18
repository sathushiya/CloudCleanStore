<?php

namespace App\Http\Controllers\Api\Orders;

use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\CheckoutRequest;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()
            ->orders()
            ->with(['items', 'assignedTo'])
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $orders]);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        abort_if($order->user_id !== $request->user()->id, 403, 'You can only view your own orders.');

        $order->load(['items', 'assignedTo']);

        return response()->json(['success' => true, 'data' => $order]);
    }

    public function checkout(CheckoutRequest $request): JsonResponse
    {
        $user = $request->user();

        $cartItems = CartItem::query()
            ->where('user_id', $user->id)
            ->with(['variant.product.brand'])
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Your cart is empty.',
            ], 422);
        }

        $order = DB::transaction(function () use ($user, $cartItems, $request) {
            $total = $cartItems->sum(function (CartItem $cartItem) {
                return (float) $cartItem->variant->price * $cartItem->quantity;
            });

            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $this->generateOrderNumber(),
                'total' => $total,
                'status' => 'pending',
                'delivery_address' => $request->validated()['delivery_address'],
                'assigned_to' => null,
            ]);

            foreach ($cartItems as $cartItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_variant_id' => $cartItem->product_variant_id,
                    'product_name' => $cartItem->variant->product->name,
                    'variant_size' => $cartItem->variant->size,
                    'price' => $cartItem->variant->price,
                    'quantity' => $cartItem->quantity,
                ]);

                // Decrement online stock now that the order is confirmed.
                // decrement() is atomic at the DB level, so this is safe even
                // under concurrent checkouts touching the same variant.
                $cartItem->variant->decrement('online_stock', $cartItem->quantity);
            }

            CartItem::query()->where('user_id', $user->id)->delete();

            return $order;
        });

        $order->load(['items', 'assignedTo', 'user']);

        return response()->json([
            'success' => true,
            'message' => 'Order placed successfully.',
            'data' => $order,
        ], 201);
    }

    public function staffIndex(Request $request): JsonResponse
    {
        $orders = Order::with(['user', 'items', 'assignedTo'])
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $orders]);
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,processing,out_for_delivery,delivered,cancelled'],
        ]);

        $order->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully.',
            'data' => $order->fresh(['user', 'items', 'assignedTo']),
        ]);
    }

    public function assignToSelf(Request $request, Order $order): JsonResponse
    {
        $user = $request->user();

        abort_if(!$user->isStaff() && !$user->isAdmin(), 403, 'You cannot assign this order.');

        $order->update([
            'assigned_to' => $user->id,
            'status' => 'processing',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order assigned successfully.',
            'data' => $order->fresh(['user', 'items', 'assignedTo']),
        ]);
    }

    private function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'ORD-' . now()->format('YmdHis') . '-' . Str::upper(Str::random(6));
        } while (Order::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }
}
