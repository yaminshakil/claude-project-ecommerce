<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class CouponController extends Controller
{
    public function validate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code'          => 'required|string',
            'order_amount'  => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', $validated['code'])
            ->where('is_active', true)
            ->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired coupon code.',
                'data'    => null,
            ], 422);
        }

        $now = Carbon::now();

        if ($coupon->starts_at && $now->lt($coupon->starts_at)) {
            return response()->json([
                'success' => false,
                'message' => 'This coupon is not yet active.',
                'data'    => null,
            ], 422);
        }

        if ($coupon->expires_at && $now->gt($coupon->expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'This coupon has expired.',
                'data'    => null,
            ], 422);
        }

        if ($coupon->max_uses && $coupon->used_count >= $coupon->max_uses) {
            return response()->json([
                'success' => false,
                'message' => 'This coupon has reached its usage limit.',
                'data'    => null,
            ], 422);
        }

        if ($coupon->min_order_amount && $validated['order_amount'] < $coupon->min_order_amount) {
            return response()->json([
                'success' => false,
                'message' => "Minimum order amount of {$coupon->min_order_amount} required.",
                'data'    => null,
            ], 422);
        }

        // Calculate discount
        $discountAmount = 0;
        $orderAmount    = (float) $validated['order_amount'];

        if ($coupon->type === 'percentage') {
            $discountAmount = $orderAmount * ($coupon->value / 100);
            if ($coupon->max_discount_amount) {
                $discountAmount = min($discountAmount, (float) $coupon->max_discount_amount);
            }
        } else {
            $discountAmount = min((float) $coupon->value, $orderAmount);
        }

        return response()->json([
            'success' => true,
            'message' => 'Coupon applied successfully.',
            'data'    => [
                'coupon'          => $coupon,
                'discount_amount' => round($discountAmount, 2),
            ],
        ]);
    }
}
