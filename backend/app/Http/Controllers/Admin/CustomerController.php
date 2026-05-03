<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', User::ROLE_CUSTOMER)->withCount('orders');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $customers = $query->latest()->paginate(20);

        return response()->json([
            'success' => true,
            'message' => 'Customers retrieved successfully.',
            'data'    => $customers,
        ]);
    }

    public function show(User $user): JsonResponse
    {
        $user->load(['orders.items', 'addresses', 'reviews']);

        return response()->json([
            'success' => true,
            'message' => 'Customer retrieved successfully.',
            'data'    => $user,
        ]);
    }

    public function toggleStatus(User $user): JsonResponse
    {
        // Toggle account active state via email_verified_at as a proxy,
        // or add an is_active column. Here we nullify/set email_verified_at.
        if ($user->email_verified_at) {
            $user->update(['email_verified_at' => null]);
            $message = 'Customer account deactivated.';
        } else {
            $user->update(['email_verified_at' => now()]);
            $message = 'Customer account activated.';
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $user,
        ]);
    }
}
