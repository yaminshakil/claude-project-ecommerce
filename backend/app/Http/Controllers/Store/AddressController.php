<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $addresses = Address::where('user_id', $request->user()->id)->get();

        return response()->json([
            'success' => true,
            'message' => 'Addresses retrieved successfully.',
            'data'    => $addresses,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'phone'          => 'required|string|max:20',
            'address_line_1' => 'required|string',
            'address_line_2' => 'nullable|string',
            'city'           => 'required|string',
            'state'          => 'required|string',
            'zip_code'       => 'required|string',
            'country'        => 'required|string',
            'is_default'     => 'boolean',
        ]);

        $validated['user_id'] = $request->user()->id;

        if (!empty($validated['is_default'])) {
            Address::where('user_id', $request->user()->id)
                ->update(['is_default' => false]);
        }

        $address = Address::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Address created successfully.',
            'data'    => $address,
        ], 201);
    }

    public function show(Request $request, Address $address): JsonResponse
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
                'data'    => null,
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Address retrieved successfully.',
            'data'    => $address,
        ]);
    }

    public function update(Request $request, Address $address): JsonResponse
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
                'data'    => null,
            ], 403);
        }

        $validated = $request->validate([
            'name'           => 'sometimes|string|max:255',
            'phone'          => 'sometimes|string|max:20',
            'address_line_1' => 'sometimes|string',
            'address_line_2' => 'nullable|string',
            'city'           => 'sometimes|string',
            'state'          => 'sometimes|string',
            'zip_code'       => 'sometimes|string',
            'country'        => 'sometimes|string',
            'is_default'     => 'boolean',
        ]);

        if (!empty($validated['is_default'])) {
            Address::where('user_id', $request->user()->id)
                ->where('id', '!=', $address->id)
                ->update(['is_default' => false]);
        }

        $address->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Address updated successfully.',
            'data'    => $address,
        ]);
    }

    public function destroy(Request $request, Address $address): JsonResponse
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
                'data'    => null,
            ], 403);
        }

        $address->delete();

        return response()->json([
            'success' => true,
            'message' => 'Address deleted successfully.',
            'data'    => null,
        ]);
    }
}
