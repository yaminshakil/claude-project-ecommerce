<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function salesByDate(Request $request): JsonResponse
    {
        $request->validate([
            'from'     => 'nullable|date',
            'to'       => 'nullable|date',
            'group_by' => 'nullable|in:day,week,month',
        ]);

        $from    = $request->get('from', now()->subDays(30)->toDateString());
        $to      = $request->get('to', now()->toDateString());
        $groupBy = $request->get('group_by', 'day');

        $dateFormat = match ($groupBy) {
            'week'  => '%Y-%u',
            'month' => '%Y-%m',
            default => '%Y-%m-%d',
        };

        $sales = Order::where('payment_status', 'paid')
            ->whereDate('created_at', '>=', $from)
            ->whereDate('created_at', '<=', $to)
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$dateFormat}') as period"),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(total) as total_revenue')
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Sales report retrieved successfully.',
            'data'    => [
                'from'  => $from,
                'to'    => $to,
                'sales' => $sales,
            ],
        ]);
    }

    public function topProducts(Request $request): JsonResponse
    {
        $request->validate([
            'from'  => 'nullable|date',
            'to'    => 'nullable|date',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $from  = $request->get('from', now()->subDays(30)->toDateString());
        $to    = $request->get('to', now()->toDateString());
        $limit = $request->get('limit', 10);

        $topProducts = OrderItem::with('product.images')
            ->whereHas('order', function ($q) use ($from, $to) {
                $q->where('payment_status', 'paid')
                  ->whereDate('created_at', '>=', $from)
                  ->whereDate('created_at', '<=', $to);
            })
            ->select(
                'product_id',
                'product_name',
                DB::raw('SUM(quantity) as total_sold'),
                DB::raw('SUM(total) as total_revenue')
            )
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_sold')
            ->take($limit)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Top products report retrieved successfully.',
            'data'    => [
                'from'     => $from,
                'to'       => $to,
                'products' => $topProducts,
            ],
        ]);
    }
}
