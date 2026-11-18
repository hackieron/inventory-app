<?php

use App\Http\Controllers\Api\ContactController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('contacts', ContactController::class)
        ->only(['index', 'store', 'show', 'update', 'destroy']);
});
