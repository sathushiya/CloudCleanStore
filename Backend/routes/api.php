<?php

use App\Http\Controllers\Api\Auth\AuthController;
use Illuminate\Support\Facades\Route;

// ─── Public Auth Routes (no token needed) ────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/verify-reset-otp', [AuthController::class, 'verifyPasswordResetOtp']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
});

// ─── Protected Routes (require valid Sanctum token) ──────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    // Admin only routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        // Phase 2: Admin management routes go here
        Route::get('/dashboard', fn() => response()->json(['message' => 'Admin dashboard — Phase 2']));
    });

    // Staff + Admin + Staff Supervisor routes
    Route::middleware('role:admin,staff,staffsupervisor')->prefix('staff')->group(function () {
        // Phase 2: Staff routes go here
        Route::get('/dashboard', fn() => response()->json(['message' => 'Staff dashboard — Phase 2']));
    });

    // Customer routes
    Route::middleware('role:customer')->prefix('customer')->group(function () {
        // Phase 2: Customer routes go here
        Route::get('/profile', fn() => response()->json(['message' => 'Customer profile — Phase 2']));
    });
});
