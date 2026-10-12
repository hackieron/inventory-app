
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BorrowingRequestController;

Route::middleware('auth:sanctum')->group(function () {

    // Incoming requests for my items
    Route::get('/borrowing-requests/incoming', [
        BorrowingRequestController::class, 'incoming'
    ]);

    // Requests I have made
    Route::get('/borrowing-requests/my', [
        BorrowingRequestController::class, 'myRequests'
    ]);

    // Request to borrow an item
    Route::post('/items/{item}/borrowing-request', [
        BorrowingRequestController::class, 'store'
    ]);

    // Owner actions
    Route::post('/borrowing-requests/{borrowingRequest}/approve', [
        BorrowingRequestController::class, 'approve'
    ]);

    Route::post('/borrowing-requests/{borrowingRequest}/reject', [
        BorrowingRequestController::class, 'reject'
    ]);

    // Requester action
    Route::post('/borrowing-requests/{borrowingRequest}/cancel', [
        BorrowingRequestController::class, 'cancel'
    ]);

});
