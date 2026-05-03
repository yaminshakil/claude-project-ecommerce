<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::with('items')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Orders retrieved successfully.',
            'data'    => $orders,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shipping_address'           => 'required|array',
            'shipping_address.name'      => 'required|string',
            'shipping_address.phone'     => 'required|string',
            'shipping_address.address_line_1' => 'required|string',
            'shipping_address.city'      => 'required|string',
            'shipping_address.state'     => 'required|string',
            'shipping_address.zip_code'  => 'required|string',
            'shipping_address.country'   => 'required|string',
            'payment_method'             => 'required|string',
            'coupon_code'                => 'nullable|string',
            'notes'                      => 'nullable|string',
        ]);

        $cartItems = Cart::with(['product', 'variant'])
            ->where('user_id', $request->user()->id)
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Your cart is empty.',
                'data'    => null,
            ], 422);
        }

        DB::beginTransaction();

        try {
            $subtotal       = 0;
            $orderItemsData = [];

            foreach ($cartItems as $item) {
                $product  = $item->product;
                $variant  = $item->variant;
                $price    = $variant ? $variant->price : $product->price;
                $stock    = $variant ? $variant->stock : $product->stock;

                if ($item->quantity > $stock) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => "Insufficient stock for product: {$product->name}.",
                        'data'    => null,
                    ], 422);
                }

                $itemTotal = $price * $item->quantity;
                $subtotal += $itemTotal;

                $primaryImage = $product->images()->where('is_primary', true)->first()
                    ?? $product->images()->first();

                $orderItemsData[] = [
                    'product_id'         => $product->id,
                    'product_variant_id' => $variant?->id,
                    'product_name'       => $product->name,
                    'variant_name'       => $variant?->name,
                    'product_image'      => $primaryImage?->image_path,
                    'quantity'           => $item->quantity,
                    'unit_price'         => $price,
                    'total'              => $itemTotal,
                ];
            }

            // Apply coupon if provided
            $discountAmount = 0;
            $coupon         = null;

            if (!empty($validated['coupon_code'])) {
                $coupon = Coupon::where('code', $validated['coupon_code'])
                    ->where('is_active', true)
                    ->first();

                if ($coupon) {
                    if ($coupon->type === 'percentage') {
                        $discountAmount = $subtotal * ($coupon->value / 100);
                        if ($coupon->max_discount_amount) {
                            $discountAmount = min($discountAmount, $coupon->max_discount_amount);
                        }
                    } else {
                        $discountAmount = min($coupon->value, $subtotal);
                    }
                }
            }

            $shippingFee = 0;
            $taxAmount   = 0;
            $total       = $subtotal - $discountAmount + $shippingFee + $taxAmount;

            $order = Order::create([
                'user_id'          => $request->user()->id,
                'order_number'     => 'ORD-' . strtoupper(Str::random(10)),
                'status'           => 'pending',
                'subtotal'         => $subtotal,
                'discount_amount'  => $discountAmount,
                'shipping_fee'     => $shippingFee,
                'tax_amount'       => $taxAmount,
                'total'            => $total,
                'coupon_id'        => $coupon?->id,
                'coupon_code'      => $validated['coupon_code'] ?? null,
                'payment_method'   => $validated['payment_method'],
                'payment_status'   => 'pending',
                'shipping_address' => $validated['shipping_address'],
                'notes'            => $validated['notes'] ?? null,
            ]);

            foreach ($orderItemsData as $itemData) {
                $order->items()->create($itemData);

                // Decrement stock
                if ($itemData['product_variant_id']) {
                    ProductVariant::where('id', $itemData['product_variant_id'])
                        ->decrement('stock', $itemData['quantity']);
                } else {
                    Product::where('id', $itemData['product_id'])
                        ->decrement('stock', $itemData['quantity']);
                }
            }

            // Increment coupon used_count
            if ($coupon) {
                $coupon->increment('used_count');
            }

            // Clear user cart
            Cart::where('user_id', $request->user()->id)->delete();

            DB::commit();

            $order->load('items');

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully.',
                'data'    => $order,
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to place order. Please try again.',
                'data'    => null,
            ], 500);
        }
    }

    public function show(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::with('items')
            ->where('user_id', $request->user()->id)
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'message' => 'Order retrieved successfully.',
            'data'    => $order,
        ]);
    }
}
