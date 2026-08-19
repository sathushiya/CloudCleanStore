<?php

namespace App\Http\Controllers\Api\Orders;

use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\CheckoutRequest;
use App\Models\CartItem;
use App\Models\Notification;
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
                    'order_number' => 'ORD-' . now()->format('Y') . '-' . strtoupper(Str::random(6)),
                    'total' => $total,
                    'status' => 'pending',
                    'delivery_address' => $request->delivery_address,
                    'payment_method' => $request->input('payment_method', 'cash'),
                    'payment_status' => 'pending',
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

        Notification::log(
            'order',
            'New Order Received',
            "Order #{$order->order_number} needs delivery assignment.",
            'high',
        );

        return response()->json([
            'success' => true,
            'message' => 'Order placed successfully.',
            'data' => $order,
        ], 201);
    }

    public function staffIndex(Request $request): JsonResponse
    {
        $query = Order::with(['items', 'user', 'assignedTo']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->string('payment_status'));
        }

        $orders = $query->orderByDesc('created_at')->get();
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

    // Staff/delivery calling this without a body still just assigns to
    // themselves (unchanged behavior for the existing "Assign to Me"
    // button). Supervisors/admins can additionally pass staff_id to assign
    // the order to a specific staff member instead of themselves -- used by
    // SupervisorDashboard's "Awaiting Orders" manual assignment dropdown.
    public function assignToSelf(Request $request, Order $order): JsonResponse
    {
        $user = $request->user();

        abort_if(!$user->isStaff() && !$user->isAdmin(), 403, 'You cannot assign this order.');

        $request->validate([
            'staff_id' => ['sometimes', 'integer', 'exists:users,id'],
        ]);

        $assigneeId = $request->filled('staff_id') ? $request->integer('staff_id') : $user->id;

        // Only a supervisor/admin may assign to someone other than themselves.
        if ($assigneeId !== $user->id) {
            abort_if(!$user->isAdmin() && !$user->isSupervisor(), 403, 'Only a supervisor or admin can assign orders to other staff members.');
        }

        $order->update([
            'assigned_to' => $assigneeId,
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

    // POST /api/customer/orders/{order}/submit-payment — customer submits bank transfer proof
    public function submitPayment(Request $request, Order $order): JsonResponse
    {
        abort_if($order->user_id !== $request->user()->id, 403, 'This order does not belong to you.');

        $request->validate([
            'payment_reference' => ['required', 'string', 'max:255'],
            'payment_proof_url' => ['nullable', 'string'],
        ]);

        $order->update([
            'payment_reference' => $request->payment_reference,
            'payment_proof_url' => $request->payment_proof_url,
            'payment_status' => 'submitted',
        ]);

        Notification::log(
            'order',
            'Payment Submitted',
            "Customer submitted a bank transfer reference for order #{$order->order_number}. Awaiting verification.",
            'medium',
        );

        return response()->json(['success' => true, 'message' => 'Payment details submitted for verification.', 'data' => $order]);
    }

    // PATCH /api/staff/orders/{order}/confirm-payment
    public function confirmPayment(Request $request, Order $order): JsonResponse
    {
        $request->validate(['approved' => ['required', 'boolean']]);

        $order->update([
            'payment_status' => $request->boolean('approved') ? 'confirmed' : 'rejected',
        ]);

        return response()->json(['success' => true, 'message' => 'Payment status updated.', 'data' => $order]);
    }
}
