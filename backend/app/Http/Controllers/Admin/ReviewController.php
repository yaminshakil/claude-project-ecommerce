<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Review::with(['user', 'product']);

        if ($request->filled('is_approved')) {
            $query->where('is_approved', (bool) $request->is_approved);
        }

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        $reviews = $query->latest()->paginate(20);

        return response()->json([
            'success' => true,
            'message' => 'Reviews retrieved successfully.',
            'data'    => $reviews,
        ]);
    }

    public function approve(Review $review): JsonResponse
    {
        $review->update(['is_approved' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Review approved successfully.',
            'data'    => $review,
        ]);
    }

    public function destroy(Review $review): JsonResponse
    {
        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Review deleted successfully.',
            'data'    => null,
        ]);
    }
}
