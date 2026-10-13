<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AdminController;

Route::prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/applications', [AdminController::class, 'applications']);
    Route::post('/applications/{id}/decision', [AdminController::class, 'applicationDecision']);
    
    Route::get('/users', [AdminController::class, 'users']);
    Route::post('/users/{id}/toggle-status', [AdminController::class, 'toggleUserStatus']);
    
    Route::get('/categories', [AdminController::class, 'categories']);
    Route::post('/categories', [AdminController::class, 'storeCategory']);
    Route::post('/categories/{id}/toggle-status', [AdminController::class, 'toggleCategoryStatus']);
    
    Route::get('/services', [AdminController::class, 'services']);
    Route::get('/wanted-ads', [AdminController::class, 'wantedAds']);
    Route::get('/bookings', [AdminController::class, 'bookings']);
    Route::get('/reviews', [AdminController::class, 'reviews']);
    
    Route::get('/complaints', [AdminController::class, 'complaints']);
    Route::post('/complaints/{id}/resolve', [AdminController::class, 'resolveComplaint']);
    
    Route::get('/revenue', [AdminController::class, 'revenue']);
    Route::get('/reports', [AdminController::class, 'reports']);
    Route::get('/audit-logs', [AdminController::class, 'auditLogs']);
    
    Route::get('/settings', [AdminController::class, 'settings']);
    Route::post('/settings', [AdminController::class, 'updateSettings']);
});