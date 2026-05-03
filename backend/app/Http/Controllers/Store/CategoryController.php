<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        // Return root-level categories with their children (tree structure)
        $categories = Category::with('children')
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Categories retrieved successfully.',
            'data'    => $categories,
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $category = Category::with(['children', 'products' => function ($q) {
            $q->where('is_active', true)
              ->with(['images', 'brand'])
              ->paginate(16);
        }])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'message' => 'Category retrieved successfully.',
            'data'    => $category,
        ]);
    }
}
