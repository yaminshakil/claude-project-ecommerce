<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function index(): JsonResponse
    {
        $coupons = Coupon::latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Coupons retrieved successfully.',
            'data'    => $coupons,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code'                => 'required|string|unique:coupons,code',
            'type'                => 'required|in:percentage,fixed',
            'value'               => 'required|numeric|min:0',
            'min_order_amount'    => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'max_uses'            => 'nullable|integer|min:1',
            'max_uses_per_user'   => 'nullable|integer|min:1',
            'starts_at'           => 'nullable|date',
            'expires_at'          => 'nullable|date|after_or_equal:starts_at',
            'is_active'           => 'boolean',
        ]);

        $coupon = Coupon::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Coupon created successfully.',
            'data'    => $coupon,
        ], 201);
    }

    public function update(Request $request, Coupon $coupon): JsonResponse
    {
        $validated = $request->validate([
            'code'                => 'sometimes|string|unique:coupons,code,' . $coupon->id,
            'type'                => 'sometimes|in:percentage,fixed',
            'value'               => 'sometimes|numeric|min:0',
            'min_order_amount'    => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'max_uses'            => 'nullable|integer|min:1',
            'max_uses_per_user'   => 'nullable|integer|min:1',
            'starts_at'           => 'nullable|date',
            'expires_at'          => 'nullable|date',
            'is_active'           => 'boolean',
        ]);

        $coupon->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Coupon updated successfully.',
            'data'    => $coupon,
        ]);
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        $coupon->delete();

        return response()->json([
            'success' => true,
            'message' => 'Coupon deleted successfully.',
            'data'    => null,
        ]);
    }
}
