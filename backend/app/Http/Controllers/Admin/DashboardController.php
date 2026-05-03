<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $totalOrders    = Order::count();
        $totalRevenue   = Order::where('payment_status', 'paid')->sum('total');
        $totalCustomers = User::where('role', 'customer')->count();
        $totalProducts  = Product::count();

        $recentOrders = Order::with('user')
            ->latest()
            ->take(10)
            ->get();

        $lowStockProducts = Product::where('stock', '<=', DB::raw('low_stock_threshold'))
            ->where('is_active', true)
            ->with('images')
            ->take(10)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Dashboard stats retrieved successfully.',
            'data'    => [
                'total_orders'      => $totalOrders,
                'total_revenue'     => round($totalRevenue, 2),
                'total_customers'   => $totalCustomers,
                'total_products'    => $totalProducts,
                'recent_orders'     => $recentOrders,
                'low_stock_products'=> $lowStockProducts,
            ],
        ]);
    }
}
