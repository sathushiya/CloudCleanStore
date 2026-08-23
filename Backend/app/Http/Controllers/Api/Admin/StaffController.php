<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStaffRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StaffController extends Controller
{
    public function index(): JsonResponse
    {
        $staff = User::whereIn('role', ['admin', 'staff', 'staffsupervisor'])
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'phone_number', 'role', 'is_active', 'is_available', 'created_at']);
        return response()->json(['success' => true, 'data' => $staff]);
    }

    public function store(StoreStaffRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'] ?? null,
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Staff account created successfully.',
            'data' => $user->only(['id', 'name', 'email', 'phone_number', 'role', 'is_active']),
        ], 201);
    }

    public function update(StoreStaffRequest $request, User $staff): JsonResponse
    {
        $validated = $request->validated();

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'] ?? null,
            'role' => $validated['role'],
            'is_active' => $validated['is_active'] ?? $staff->is_active,
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $staff->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Staff account updated successfully.',
            'data' => $staff->only(['id', 'name', 'email', 'phone_number', 'role', 'is_active']),
        ]);
    }

        public function destroy(Request $request, User $staff): JsonResponse
    {
        abort_if($staff->id === $request->user()->id, 422, 'You cannot delete your own account.');

        $staff->delete();

        return response()->json(['success' => true, 'message' => 'Staff account removed.']);
    }

    // GET /api/admin/staff/performance -- "tasks completed" per staff member,
    // derived from real order data (delivered orders assigned to them) rather
    // than any invented gamification numbers.
    public function performance(): JsonResponse
    {
        $staff = User::whereIn('role', ['admin', 'staff', 'staffsupervisor'])
            ->withCount(['assignedOrders as tasks_completed' => function ($query) {
                $query->where('status', 'delivered');
            }])
            ->orderByDesc('tasks_completed')
            ->get(['id', 'name', 'role']);

        return response()->json(['success' => true, 'data' => $staff]);
    }

    // PATCH /api/staff/availability -- the authenticated staff/staffsupervisor
    // toggles their own online/offline status. Deliberately self-only (no
    // user_id param) since only the person clocking themselves in/out should
    // be able to change this, unlike order assignment which a supervisor can
    // do on someone else's behalf.
    public function updateAvailability(Request $request): JsonResponse
    {
        $request->validate(['is_available' => ['required', 'boolean']]);

        $user = $request->user();
        $user->update(['is_available' => $request->boolean('is_available')]);

        return response()->json([
            'success' => true,
            'message' => $user->is_available ? 'You are now available for deliveries.' : 'You are now offline.',
            'data' => ['is_available' => $user->is_available],
        ]);
    }
}