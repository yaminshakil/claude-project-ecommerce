<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    public function index(): JsonResponse
    {
        $brands = Brand::withCount('products')->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Brands retrieved successfully.',
            'data'    => $brands,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'slug'        => 'nullable|string|unique:brands,slug',
            'description' => 'nullable|string',
            'logo'        => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);

        $brand = Brand::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Brand created successfully.',
            'data'    => $brand,
        ], 201);
    }

    public function update(Request $request, Brand $brand): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'slug'        => 'sometimes|string|unique:brands,slug,' . $brand->id,
            'description' => 'nullable|string',
            'logo'        => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $brand->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Brand updated successfully.',
            'data'    => $brand,
        ]);
    }

    public function destroy(Brand $brand): JsonResponse
    {
        $brand->delete();

        return response()->json([
            'success' => true,
            'message' => 'Brand deleted successfully.',
            'data'    => null,
        ]);
    }
}
