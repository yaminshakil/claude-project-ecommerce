<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cartItems = Cart::with(['product.images', 'variant'])
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Cart retrieved successfully.',
            'data'    => $cartItems,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id'         => 'required|integer|exists:products,id',
            'product_variant_id' => 'nullable|integer|exists:product_variants,id',
            'quantity'           => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        if (!$product->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Product is not available.',
                'data'    => null,
            ], 422);
        }

        // Check stock
        $stock = $product->stock;
        if (!empty($validated['product_variant_id'])) {
            $variant = ProductVariant::find($validated['product_variant_id']);
            if ($variant) {
                $stock = $variant->stock;
            }
        }

        if ($validated['quantity'] > $stock) {
            return response()->json([
                'success' => false,
                'message' => 'Requested quantity exceeds available stock.',
                'data'    => null,
            ], 422);
        }

        $cartItem = Cart::updateOrCreate(
            [
                'user_id'            => $request->user()->id,
                'product_id'         => $validated['product_id'],
                'product_variant_id' => $validated['product_variant_id'] ?? null,
            ],
            [
                'quantity' => $validated['quantity'],
            ]
        );

        $cartItem->load(['product.images', 'variant']);

        return response()->json([
            'success' => true,
            'message' => 'Item added to cart.',
            'data'    => $cartItem,
        ], 201);
    }

    public function update(Request $request, Cart $cart): JsonResponse
    {
        if ($cart->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
                'data'    => null,
            ], 403);
        }

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cart->update(['quantity' => $validated['quantity']]);
        $cart->load(['product.images', 'variant']);

        return response()->json([
            'success' => true,
            'message' => 'Cart item updated.',
            'data'    => $cart,
        ]);
    }

    public function destroy(Request $request, Cart $cart): JsonResponse
    {
        if ($cart->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
                'data'    => null,
            ], 403);
        }

        $cart->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cart item removed.',
            'data'    => null,
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        Cart::where('user_id', $request->user()->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared.',
            'data'    => null,
        ]);
    }
}
