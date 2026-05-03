<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'brand', 'images']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', (bool) $request->is_active);
        }

        $products = $query->latest()->paginate(20);

        return response()->json([
            'success' => true,
            'message' => 'Products retrieved successfully.',
            'data'    => $products,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'                => 'required|string|max:255',
            'slug'                => 'nullable|string|unique:products,slug',
            'short_description'   => 'nullable|string',
            'description'         => 'nullable|string',
            'price'               => 'required|numeric|min:0',
            'compare_price'       => 'nullable|numeric|min:0',
            'sku'                 => 'nullable|string|unique:products,sku',
            'stock'               => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'category_id'         => 'nullable|integer|exists:categories,id',
            'brand_id'            => 'nullable|integer|exists:brands,id',
            'weight'              => 'nullable|numeric|min:0',
            'dimensions'          => 'nullable|array',
            'is_featured'         => 'boolean',
            'is_active'           => 'boolean',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);

        $product = Product::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully.',
            'data'    => $product->load(['category', 'brand', 'images']),
        ], 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'name'                => 'sometimes|string|max:255',
            'slug'                => 'sometimes|string|unique:products,slug,' . $product->id,
            'short_description'   => 'nullable|string',
            'description'         => 'nullable|string',
            'price'               => 'sometimes|numeric|min:0',
            'compare_price'       => 'nullable|numeric|min:0',
            'sku'                 => 'sometimes|string|unique:products,sku,' . $product->id,
            'stock'               => 'sometimes|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'category_id'         => 'nullable|integer|exists:categories,id',
            'brand_id'            => 'nullable|integer|exists:brands,id',
            'weight'              => 'nullable|numeric|min:0',
            'dimensions'          => 'nullable|array',
            'is_featured'         => 'boolean',
            'is_active'           => 'boolean',
        ]);

        if (isset($validated['name']) && !isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully.',
            'data'    => $product->load(['category', 'brand', 'images']),
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        // Delete associated images from storage
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully.',
            'data'    => null,
        ]);
    }

    public function uploadImages(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'images'          => 'required|array|min:1',
            'images.*'        => 'image|max:4096',
            'is_primary'      => 'nullable|boolean',
        ]);

        $uploadedImages   = [];
        $hasExisting      = ProductImage::where('product_id', $product->id)->exists();
        $makePrimary      = !$hasExisting; // first-ever upload auto-becomes primary

        foreach ($request->file('images') as $index => $image) {
            $path      = $image->store('products', 'public');
            $isPrimary = ($index === 0 && $makePrimary);

            if ($isPrimary) {
                ProductImage::where('product_id', $product->id)->update(['is_primary' => false]);
            }

            $maxSort = ProductImage::where('product_id', $product->id)->max('sort_order') ?? 0;

            $productImage = ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $path,
                'alt_text'   => $product->name,
                'sort_order' => $maxSort + $index + 1,
                'is_primary' => $isPrimary,
            ]);

            $uploadedImages[] = $productImage;
        }

        return response()->json([
            'success' => true,
            'message' => 'Images uploaded successfully.',
            'data'    => $uploadedImages,
        ], 201);
    }

    public function deleteImage(Product $product, ProductImage $image): JsonResponse
    {
        if ($image->product_id !== $product->id) {
            return response()->json(['success' => false, 'message' => 'Image not found.'], 404);
        }

        Storage::disk('public')->delete($image->image_path);
        $image->delete();

        // Promote another image to primary if needed
        if ($image->is_primary) {
            $next = ProductImage::where('product_id', $product->id)->first();
            $next?->update(['is_primary' => true]);
        }

        return response()->json(['success' => true, 'message' => 'Image deleted.', 'data' => null]);
    }

    public function setPrimaryImage(Product $product, ProductImage $image): JsonResponse
    {
        if ($image->product_id !== $product->id) {
            return response()->json(['success' => false, 'message' => 'Image not found.'], 404);
        }

        ProductImage::where('product_id', $product->id)->update(['is_primary' => false]);
        $image->update(['is_primary' => true]);

        return response()->json(['success' => true, 'message' => 'Primary image updated.', 'data' => $image]);
    }
}
