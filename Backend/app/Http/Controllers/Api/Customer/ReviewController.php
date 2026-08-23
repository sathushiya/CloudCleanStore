<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    // GET /api/reviews -- public, powers the landing page testimonials.
    // Only 4-5 star reviews are shown there; every review still counts
    // toward a product's aggregate rating regardless of score.
    public function index(): JsonResponse
    {
        $reviews = Review::with('user:id,name')
            ->where('rating', '>=', 4)
            ->latest()
            ->limit(9)
            ->get()
            ->map(fn (Review $review) => [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'name' => $review->user->name,
                'created_at' => $review->created_at,
            ]);

        return response()->json(['success' => true, 'data' => $reviews]);
    }

    // POST /api/customer/orders/{order}/review
    public function store(Request $request, Order $order): JsonResponse
    {
        abort_if($order->user_id !== $request->user()->id, 403, 'This order does not belong to you.');

        if ($order->status !== 'delivered') {
            return response()->json([
                'success' => false,
                'message' => 'You can only review an order after it has been delivered.',
            ], 422);
        }

        if ($order->review()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'You already reviewed this order.',
            ], 422);
        }

        $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['required', 'string', 'min:10', 'max:1000'],
        ]);

        $review = Review::create([
            'user_id' => $request->user()->id,
            'order_id' => $order->id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thanks for your review!',
            'data' => $review,
        ], 201);
    }
}
