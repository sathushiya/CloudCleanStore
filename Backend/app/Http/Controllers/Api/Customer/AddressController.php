<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreAddressRequest;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()->addresses()->orderByDesc('is_default')->get();
        return response()->json(['success' => true, 'data' => $addresses]);
    }

    public function store(StoreAddressRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        // First address, or explicitly marked default -> make it the default
        if ($request->boolean('is_default') || $user->addresses()->doesntExist()) {
            $user->addresses()->update(['is_default' => false]);
            $validated['is_default'] = true;
        }

        $address = $user->addresses()->create($validated);

        return response()->json(['success' => true, 'message' => 'Address added successfully.', 'data' => $address], 201);
    }

    public function update(StoreAddressRequest $request, Address $address): JsonResponse
    {
        $this->authorizeOwner($request, $address);
        $validated = $request->validated();

        if ($request->boolean('is_default')) {
            $request->user()->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
            $validated['is_default'] = true;
        }

        $address->update($validated);

        return response()->json(['success' => true, 'message' => 'Address updated successfully.', 'data' => $address]);
    }

    public function destroy(Request $request, Address $address): JsonResponse
    {
        $this->authorizeOwner($request, $address);
        $wasDefault = $address->is_default;
        $address->delete();

        if ($wasDefault) {
            $request->user()->addresses()->first()?->update(['is_default' => true]);
        }

        return response()->json(['success' => true, 'message' => 'Address deleted successfully.']);
    }

    private function authorizeOwner(Request $request, Address $address): void
    {
        abort_if($address->user_id !== $request->user()->id, 403, 'This address does not belong to you.');
    }
}