<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BonSortieController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\RapportFinancierController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\StockMovementController;


Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/articles', [ArticleController::class, 'index']);

    Route::middleware('role:stock')->group(function () {
        Route::post('/articles', [ArticleController::class, 'store']);
        Route::put('/articles/{article}', [ArticleController::class, 'update']);
        Route::delete('/articles/{article}', [ArticleController::class, 'destroy']);
        Route::post('/articles/{article}/movements', [StockMovementController::class, 'store']);
        Route::get('/bons-sortie', [BonSortieController::class, 'show']);
        Route::get('/notifications/low-stock', [NotificationController::class, 'lowStock']);
    });

    Route::middleware('role:prix')->group(function () {
        Route::patch('/articles/{article}/price', [ArticleController::class, 'updatePrice']);
        Route::get('/rapports-financiers', [RapportFinancierController::class, 'show']);
    });
});
