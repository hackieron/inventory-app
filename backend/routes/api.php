<?php

use App\Http\Controllers\Api\BorrowingController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\GoogleAuthController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\ItemHistoryController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\ReturnRequestController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BorrowingRequestController;




Route::apiResource('categories', CategoryController::class);
Route::apiResource('locations', LocationController::class);
Route::middleware('auth:sanctum')->group(function () {
    Route::get(
        '/items/discover',
        [ItemController::class, 'discover']
    );

    Route::apiResource('items', ItemController::class);
    Route::post(
        '/items/{id}/make-borrowable',
        [ItemController::class, 'makeItemBorrowable']
    );

});

//borrowings
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/items/{item}/borrow', [
        BorrowingController::class,
        'borrow',
    ]);

    Route::post('/borrowings/{borrowing}/return', [
        BorrowingController::class,
        'returnItem',
    ]);

    Route::get('/items/{item}/borrowings', [
        BorrowingController::class,
        'itemBorrowings',
    ]);

    Route::get('/borrowings/{borrowing}', [
        BorrowingController::class,
        'show',
    ]);
});
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/borrowings', [
        BorrowingController::class,
        'myBorrowings'
    ]);

    // your other borrowing routes...
});
Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Borrowing Requests
    |--------------------------------------------------------------------------
    */

    // Incoming requests for my items
    Route::get(
        '/borrowing-requests/incoming',
        [BorrowingRequestController::class, 'incoming']
    );

    // Requests I have made
    Route::get(
        '/borrowing-requests/my',
        [BorrowingRequestController::class, 'myRequests']
    );

    // Request to borrow someone else's item
    Route::post(
        '/items/{item}/borrowing-request',
        [BorrowingRequestController::class, 'store']
    );

    // Owner actions
    Route::post(
        '/borrowing-requests/{borrowingRequest}/approve',
        [BorrowingRequestController::class, 'approve']
    );

    Route::post(
        '/borrowing-requests/{borrowingRequest}/reject',
        [BorrowingRequestController::class, 'reject']
    );

    // Requester action
    Route::post(
        '/borrowing-requests/{borrowingRequest}/cancel',
        [BorrowingRequestController::class, 'cancel']
    );
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/items/{item}/history', [
        ItemHistoryController::class,
        'index',
    ]);

    Route::get('/items/{item}/history/{history}', [
        ItemHistoryController::class,
        'show',
    ]);
});
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
});

Route::middleware('auth:sanctum')->get('/me', function (Request $request) {
    return response()->json([
        'data' => $request->user(),
    ]);
});
Route::post('/auth/google', [GoogleAuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get(
        '/return-requests/incoming',
        [ReturnRequestController::class, 'incoming']
    );

    Route::get(
        '/return-requests/my',
        [ReturnRequestController::class, 'myRequests']
    );

    Route::post(
        '/borrowings/{borrowing}/return-request',
        [ReturnRequestController::class, 'store']
    );

    Route::post(
        '/return-requests/{returnRequest}/approve',
        [ReturnRequestController::class, 'approve']
    );

    Route::post(
        '/return-requests/{returnRequest}/reject',
        [ReturnRequestController::class, 'reject']
    );

    Route::post(
        '/return-requests/{returnRequest}/cancel',
        [ReturnRequestController::class, 'cancel']
    );
});