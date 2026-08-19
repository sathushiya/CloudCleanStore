<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Catalog\BrandController;
use App\Http\Controllers\Api\Catalog\CartController;
use App\Http\Controllers\Api\Catalog\MediaController;
use App\Http\Controllers\Api\Catalog\ProductController;
use App\Http\Controllers\Api\Customer\AddressController;
use App\Http\Controllers\Api\Customer\WishlistController;
use App\Http\Controllers\Api\Orders\OrderController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\StaffController;
use App\Http\Controllers\Api\Auth\PhoneVerificationController;

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

Route::get('/brands', [BrandController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {

    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    Route::prefix('phone')->group(function () {
        Route::post('/check-whatsapp', [PhoneVerificationController::class, 'checkWhatsapp']);
        Route::post('/send-otp', [PhoneVerificationController::class, 'sendOtp']);
        Route::post('/verify-otp', [PhoneVerificationController::class, 'verifyOtp']);
    });

    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', fn() => response()->json(['message' => 'Admin dashboard — Phase 2']));

        Route::get('/brands', [BrandController::class, 'adminIndex']);
        Route::post('/brands', [BrandController::class, 'store']);
        Route::put('/brands/{brand}', [BrandController::class, 'update']);
        Route::delete('/brands/{brand}', [BrandController::class, 'destroy']);

        Route::get('/products', [ProductController::class, 'adminIndex']);
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
        Route::patch('/products/variants/{variant}/stock', [ProductController::class, 'updateVariantStock']);

        Route::post('/media/upload', [MediaController::class, 'upload']);
        Route::get('/staff', [StaffController::class, 'index']);
        Route::post('/staff', [StaffController::class, 'store']);
        Route::put('/staff/{staff}', [StaffController::class, 'update']);
        Route::delete('/staff/{staff}', [StaffController::class, 'destroy']);
    });

    Route::middleware('role:admin,staff,staffsupervisor')->prefix('staff')->group(function () {
        Route::get('/dashboard', fn() => response()->json(['message' => 'Staff dashboard — Phase 2']));

        Route::get('/orders', [OrderController::class, 'staffIndex']);
        Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);
        Route::patch('/orders/{order}/assign', [OrderController::class, 'assignToSelf']);
    });

    Route::middleware('role:customer')->prefix('customer')->group(function () {
        Route::get('/profile', [\App\Http\Controllers\Api\Customer\ProfileController::class, 'show']);
        Route::put('/profile', [\App\Http\Controllers\Api\Customer\ProfileController::class, 'update']);
        Route::put('/profile/preferences', [\App\Http\Controllers\Api\Customer\ProfileController::class, 'updatePreferences']);

        Route::get('/cart', [CartController::class, 'index']);
        Route::post('/cart', [CartController::class, 'store']);
        Route::patch('/cart/{cartItem}', [CartController::class, 'update']);
        Route::delete('/cart/{cartItem}', [CartController::class, 'destroy']);
        Route::delete('/cart', [CartController::class, 'clear']);

        Route::post('/orders/checkout', [OrderController::class, 'checkout']);
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);

        Route::get('/addresses', [AddressController::class, 'index']);
        Route::post('/addresses', [AddressController::class, 'store']);
        Route::put('/addresses/{address}', [AddressController::class, 'update']);
        Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);

        Route::get('/wishlist', [WishlistController::class, 'index']);
        Route::post('/wishlist', [WishlistController::class, 'store']);
        Route::delete('/wishlist/{product}', [WishlistController::class, 'destroy']);

        Route::post('/orders/checkout', [OrderController::class, 'checkout']);
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);
        Route::post('/orders/{order}/submit-payment', [OrderController::class, 'submitPayment']);
    });
});
