<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Profile retrieved successfully.',
            'data'    => $request->user()->load('addresses'),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'   => 'sometimes|string|max:255',
            'phone'  => 'sometimes|nullable|string|max:20',
            'avatar' => 'sometimes|nullable|image|max:2048',
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data'    => $user,
        ]);
    }

    // Address CRUD (used via AddressController resource route)

    public function addresses(Request $request): JsonResponse
    {
        $addresses = Address::where('user_id', $request->user()->id)->get();

        return response()->json([
            'success' => true,
            'message' => 'Addresses retrieved successfully.',
            'data'    => $addresses,
        ]);
    }
}
