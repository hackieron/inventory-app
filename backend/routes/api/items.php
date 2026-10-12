
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ItemController;

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/items/discover', [
        ItemController::class, 'discover'
    ]);

    Route::apiResource('items', ItemController::class);

    Route::post('/items/{id}/make-borrowable', [
        ItemController::class, 'makeItemBorrowable'
    ]);

});
