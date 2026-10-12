
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BorrowingController;

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/borrowings', [
        BorrowingController::class, 'myBorrowings'
    ]);

    Route::post('/items/{item}/borrow', [
        BorrowingController::class, 'borrow'
    ]);

    Route::post('/borrowings/{borrowing}/return', [
        BorrowingController::class, 'returnItem'
    ]);

    Route::get('/items/{item}/borrowings', [
        BorrowingController::class, 'itemBorrowings'
    ]);

    Route::get('/borrowings/{borrowing}', [
        BorrowingController::class, 'show'
    ]);

});
