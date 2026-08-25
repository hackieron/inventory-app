<?php

namespace App\Swagger;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'Personal Inventory API',
    description: 'API for managing personal items, locations, categories, borrowers, and item history.'
)]
#[OA\Server(
    url: 'http://127.0.0.1:8000',
    description: 'Local Development Server'
)]
class OpenApi
{
}