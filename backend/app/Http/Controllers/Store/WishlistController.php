<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = Wishlist::with('product.images')
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Wishlist retrieved successfully.',
            'data'    => $items,
        ]);
    }

    public function toggle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
        ]);

        $existing = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($existing) {
            $existing->delete();

            return response()->json([
                'success' => true,
                'message' => 'Product removed from wishlist.',
                'data'    => ['wishlisted' => false],
            ]);
        }

        Wishlist::create([
            'user_id'    => $request->user()->id,
            'product_id' => $validated['product_id'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product added to wishlist.',
            'data'    => ['wishlisted' => true],
        ], 201);
    }

    public function check(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
        ]);

        $wishlisted = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $validated['product_id'])
            ->exists();

        return response()->json([
            'success' => true,
            'message' => 'Wishlist status retrieved.',
            'data'    => ['wishlisted' => $wishlisted],
        ]);
    }
}
