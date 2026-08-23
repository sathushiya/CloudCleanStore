<?php

namespace App\Http\Controllers\Api\Orders;

use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\CheckoutRequest;
use App\Models\CartItem;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Services\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    // Which statuses an order can move to from its current one. Delivered
    // and cancelled are terminal -- nothing transitions out of either.
    // "pending" can go straight to "out_for_delivery" because that's what
    // the frontend's "Mark as X" advance button actually sends for an
    // unassigned pending order (assignToSelf is what normally moves it to
    // "processing" first, as a separate automatic step, not this endpoint).
    private const ALLOWED_TRANSITIONS = [
        'pending' => ['processing', 'out_for_delivery', 'cancelled'],
        'processing' => ['out_for_delivery', 'cancelled'],
        'out_for_delivery' => ['delivered', 'cancelled'],
        'delivered' => [],
        'cancelled' => [],
    ];

    public function __construct(private WhatsAppService $whatsAppService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()
            ->orders()
            ->with(['items', 'assignedStaff', 'review'])
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $orders]);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        abort_if($order->user_id !== $request->user()->id, 403, 'You can only view your own orders.');

        $order->load(['items', 'assignedStaff', 'review']);

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

        try {
            $order = DB::transaction(function () use ($user, $cartItems, $request) {
                // Re-check stock under a row lock, inside the transaction --
                // decrement() alone is atomic but doesn't stop the quantity
                // from going negative. lockForUpdate() blocks a second
                // concurrent checkout touching the same variant until this
                // one commits (or rolls back), so it re-reads the true
                // post-decrement stock rather than racing against a stale
                // read. Cart-time checks (CartController) catch the common
                // case early; this is the real backstop.
                foreach ($cartItems as $cartItem) {
                    $variant = ProductVariant::whereKey($cartItem->product_variant_id)->lockForUpdate()->first();
                    $available = $variant->online_stock ?? 0;

                    if (!$variant || $available < $cartItem->quantity) {
                        throw new \RuntimeException(
                            "Sorry, {$cartItem->variant->product->name} ({$cartItem->variant->size}) only has {$available} left in stock. Please update your cart."
                        );
                    }
                }

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

                    $cartItem->variant->decrement('online_stock', $cartItem->quantity);
                }

                CartItem::query()->where('user_id', $user->id)->delete();

                return $order;
            });
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        $order->load(['items', 'assignedStaff', 'user']);

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
        $query = Order::with(['items', 'user', 'assignedStaff']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->string('payment_status'));
        }

        // Used for "orders staff/supervisors can actually pick up" (the
        // Available Orders list and the new-order popup) -- a bank transfer
        // order shouldn't be offered for delivery until its payment is
        // actually verified, or staff would be committing to prepare/
        // deliver something that might never get paid for. Cash orders are
        // unaffected since payment happens on delivery, not up front. This
        // is deliberately opt-in so Admin's general order browsing (which
        // should still show every pending order for oversight) is untouched.
        if ($request->boolean('available_only')) {
            $query->where(function ($q) {
                $q->where('payment_method', '!=', 'bank_transfer')
                    ->orWhere('payment_status', 'confirmed');
            });
        }

        $orders = $query->orderByDesc('created_at')->get();
        return response()->json(['success' => true, 'data' => $orders]);
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,processing,out_for_delivery,delivered,cancelled'],
        ]);

        $newStatus = $validated['status'];
        $allowed = self::ALLOWED_TRANSITIONS[$order->status] ?? [];

        if ($newStatus !== $order->status && !in_array($newStatus, $allowed, true)) {
            return response()->json([
                'success' => false,
                'message' => "Can't move an order from \"{$order->status}\" to \"{$newStatus}\".",
            ], 422);
        }

        DB::transaction(function () use ($order, $newStatus) {
            if ($newStatus === 'cancelled') {
                // Stock was reserved (decremented) at checkout -- it was
                // never actually delivered, so return it rather than
                // leaving it permanently locked away.
                $order->loadMissing('items');
                foreach ($order->items as $item) {
                    ProductVariant::whereKey($item->product_variant_id)->increment('online_stock', $item->quantity);
                }
            }

            $order->update(['status' => $newStatus]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully.',
            'data' => $order->fresh(['user', 'items', 'assignedStaff']),
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

        // Backstop for the available_only filter above -- blocks accepting
        // an unpaid bank transfer order even if someone hits this endpoint
        // directly rather than going through the filtered list.
        if ($order->payment_method === 'bank_transfer' && $order->payment_status !== 'confirmed') {
            return response()->json([
                'success' => false,
                'message' => 'This order\'s bank transfer payment has not been confirmed yet.',
            ], 422);
        }

        // Atomic claim: this UPDATE only actually matches a row if the order
        // is *still* unassigned at the moment it runs. If two staff tap
        // "Accept" on the same order within milliseconds of each other,
        // only the first UPDATE's WHERE clause matches -- the second
        // affects 0 rows and gets a clean conflict response instead of
        // silently overwriting who has it (which a plain ->update() would
        // do, since it has no such condition).
        $claimed = Order::whereKey($order->id)
            ->whereNull('assigned_to')
            ->update(['assigned_to' => $assigneeId, 'status' => 'processing']);

        if ($claimed === 0) {
            return response()->json([
                'success' => false,
                'message' => 'This order has already been claimed by someone else.',
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => 'Order assigned successfully.',
            'data' => $order->fresh(['user', 'items', 'assignedStaff']),
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

        $customer = $order->user;
        if ($customer?->phone_number) {
            $this->whatsAppService->sendMessage(
                $customer->phone_number,
                "Hi {$customer->name}! We've received your bank transfer submission for order #{$order->order_number} (LKR " . number_format($order->total, 2) . "). Please reply here with your payment receipt so we can verify it -- we'll confirm your order as soon as it's checked.",
                'payment submitted',
            );
        }

        return response()->json(['success' => true, 'message' => 'Payment details submitted for verification.', 'data' => $order]);
    }

    // PATCH /api/staff/orders/{order}/confirm-payment
    public function confirmPayment(Request $request, Order $order): JsonResponse
    {
        $request->validate(['approved' => ['required', 'boolean']]);

        $approved = $request->boolean('approved');
        $order->update(['payment_status' => $approved ? 'confirmed' : 'rejected']);

        $customer = $order->user;
        if ($customer?->phone_number) {
            $message = $approved
                ? "Great news, {$customer->name}! Your payment for order #{$order->order_number} has been verified. Your order is confirmed and will be delivered soon."
                : "Hi {$customer->name}, we couldn't verify your payment for order #{$order->order_number}. Please reply here with your payment receipt, or contact us for help.";

            $this->whatsAppService->sendMessage($customer->phone_number, $message, 'payment ' . ($approved ? 'confirmed' : 'rejected'));
        }

        return response()->json(['success' => true, 'message' => 'Payment status updated.', 'data' => $order]);
    }
}
