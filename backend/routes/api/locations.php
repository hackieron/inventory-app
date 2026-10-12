
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\LocationController;

Route::apiResource('locations', LocationController::class);
