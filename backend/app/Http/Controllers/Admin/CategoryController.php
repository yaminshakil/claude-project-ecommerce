<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::with('parent')->orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'message' => 'Categories retrieved successfully.',
            'data'    => $categories,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'slug'        => 'nullable|string|unique:categories,slug',
            'parent_id'   => 'nullable|integer|exists:categories,id',
            'image'       => 'nullable|string',
            'description' => 'nullable|string',
            'sort_order'  => 'nullable|integer|min:0',
            'is_active'   => 'boolean',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);

        $category = Category::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully.',
            'data'    => $category,
        ], 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'slug'        => 'sometimes|string|unique:categories,slug,' . $category->id,
            'parent_id'   => 'nullable|integer|exists:categories,id',
            'image'       => 'nullable|string',
            'description' => 'nullable|string',
            'sort_order'  => 'nullable|integer|min:0',
            'is_active'   => 'boolean',
        ]);

        $category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully.',
            'data'    => $category,
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully.',
            'data'    => null,
        ]);
    }
}
