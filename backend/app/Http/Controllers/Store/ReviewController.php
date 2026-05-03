<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'order_id'   => 'nullable|integer|exists:orders,id',
            'rating'     => 'required|integer|min:1|max:5',
            'title'      => 'nullable|string|max:255',
            'comment'    => 'nullable|string',
        ]);

        // Prevent duplicate reviews for same product by same user
        $existing = Review::where('user_id', $request->user()->id)
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'You have already reviewed this product.',
                'data'    => null,
            ], 422);
        }

        $review = Review::create([
            'product_id'  => $validated['product_id'],
            'user_id'     => $request->user()->id,
            'order_id'    => $validated['order_id'] ?? null,
            'rating'      => $validated['rating'],
            'title'       => $validated['title'] ?? null,
            'comment'     => $validated['comment'] ?? null,
            'is_approved' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Review submitted and pending approval.',
            'data'    => $review,
        ], 201);
    }
}
