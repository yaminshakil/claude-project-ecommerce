<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'brand', 'images'])
            ->where('is_active', true);

        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->category));
        }

        if ($request->filled('brand')) {
            $query->whereHas('brand', fn ($q) => $q->where('slug', $request->brand));
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->max_price);
        }

        if ($request->filled('is_featured')) {
            $query->where('is_featured', (bool) $request->is_featured);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $sort = $request->get('sort', 'latest');
        match ($sort) {
            'price_asc'  => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'popular'    => $query->orderBy('views_count', 'desc'),
            'featured'   => $query->orderBy('is_featured', 'desc'),
            default      => $query->latest(),
        };

        $products = $query->paginate(16);

        return response()->json([
            'success' => true,
            'message' => 'Products retrieved successfully.',
            'data'    => $products,
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::with(['category', 'brand', 'images', 'variants', 'reviews' => fn ($q) => $q->where('is_approved', true)->with('user')])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $product->increment('views_count');

        return response()->json([
            'success' => true,
            'message' => 'Product retrieved successfully.',
            'data'    => $product,
        ]);
    }
}
