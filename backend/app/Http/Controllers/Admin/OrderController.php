<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['user', 'items']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('user', fn ($u) => $u->where('email', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        $orders = $query->latest()->paginate(20);

        return response()->json([
            'success' => true,
            'message' => 'Orders retrieved successfully.',
            'data'    => $orders,
        ]);
    }

    public function show(Order $order): JsonResponse
    {
        $order->load(['user', 'items', 'coupon']);

        return response()->json([
            'success' => true,
            'message' => 'Order retrieved successfully.',
            'data'    => $order,
        ]);
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status'         => 'required|string|in:pending,processing,shipped,delivered,cancelled,refunded',
            'payment_status' => 'nullable|string|in:pending,paid,failed,refunded',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'delivered' && !$order->delivered_at) {
            $order->delivered_at = Carbon::now();
        }

        $order->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully.',
            'data'    => $order,
        ]);
    }
}
