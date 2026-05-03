<?php

use App\Http\Controllers\Admin\BrandController as AdminBrandController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Store\AddressController;
use App\Http\Controllers\Store\CartController;
use App\Http\Controllers\Store\CategoryController as StoreCategoryController;
use App\Http\Controllers\Store\CouponController;
use App\Http\Controllers\Store\OrderController;
use App\Http\Controllers\Store\ProductController as StoreProductController;
use App\Http\Controllers\Store\ProfileController;
use App\Http\Controllers\Store\ReviewController;
use App\Http\Controllers\Store\WishlistController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// -------------------------------------------------------------------------
// Public routes
// -------------------------------------------------------------------------

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/products', [StoreProductController::class, 'index']);
Route::get('/products/{slug}', [StoreProductController::class, 'show']);
Route::get('/categories', [StoreCategoryController::class, 'index']);
Route::get('/categories/{slug}', [StoreCategoryController::class, 'show']);
Route::get('/brands', fn () => response()->json([
    'success' => true,
    'message' => 'Brands retrieved successfully.',
    'data'    => \App\Models\Brand::where('is_active', true)->orderBy('name')->get(),
]));
Route::post('/coupons/validate', [CouponController::class, 'validate']);

// -------------------------------------------------------------------------
// Authenticated user routes
// -------------------------------------------------------------------------

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::apiResource('/cart', CartController::class)->except(['show']);
    Route::delete('/cart', [CartController::class, 'clear']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);

    Route::post('/reviews', [ReviewController::class, 'store']);

    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::apiResource('/profile/addresses', AddressController::class);
});

// -------------------------------------------------------------------------
// Admin routes
// -------------------------------------------------------------------------

Route::middleware(['auth:sanctum', AdminMiddleware::class])->prefix('admin')->group(function () {
    Route::get('/stats', [AdminDashboardController::class, 'stats']);

    Route::apiResource('/products', AdminProductController::class);
    Route::post('/products/{product}/images', [AdminProductController::class, 'uploadImages']);
    Route::delete('/products/{product}/images/{image}', [AdminProductController::class, 'deleteImage']);
    Route::put('/products/{product}/images/{image}/primary', [AdminProductController::class, 'setPrimaryImage']);

    Route::apiResource('/categories', AdminCategoryController::class);
    Route::apiResource('/brands', AdminBrandController::class);

    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{order}', [AdminOrderController::class, 'show']);
    Route::put('/orders/{order}/status', [AdminOrderController::class, 'updateStatus']);

    Route::get('/customers', [AdminCustomerController::class, 'index']);
    Route::get('/customers/{user}', [AdminCustomerController::class, 'show']);
    Route::put('/customers/{user}/toggle-status', [AdminCustomerController::class, 'toggleStatus']);

    Route::apiResource('/coupons', AdminCouponController::class);

    Route::get('/reviews', [AdminReviewController::class, 'index']);
    Route::put('/reviews/{review}/approve', [AdminReviewController::class, 'approve']);
    Route::delete('/reviews/{review}', [AdminReviewController::class, 'destroy']);

    Route::get('/reports/sales', [AdminReportController::class, 'salesByDate']);
    Route::get('/reports/top-products', [AdminReportController::class, 'topProducts']);
});
