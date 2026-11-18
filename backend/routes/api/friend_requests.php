<?php

use App\Http\Controllers\Api\FriendRequestController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users/search', [FriendRequestController::class, 'users']);
    Route::get('/friend-requests/sent', [FriendRequestController::class, 'sent']);
    Route::get('/friend-requests/incoming', [FriendRequestController::class, 'incoming']);
    Route::post('/friend-requests', [FriendRequestController::class, 'store']);
    Route::patch('/friend-requests/{friendRequest}', [FriendRequestController::class, 'update']);
});
