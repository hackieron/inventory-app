
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ItemHistoryController;

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/items/{item}/history', [
        ItemHistoryController::class, 'index'
    ]);

    Route::get('/items/{item}/history/{history}', [
        ItemHistoryController::class, 'show'
    ]);

});
