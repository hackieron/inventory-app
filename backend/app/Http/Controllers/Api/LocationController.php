<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class LocationController extends Controller
{
    #[OA\Get(
        path: '/api/locations',
        operationId: 'getLocations',
        summary: 'Get all locations',
        description: 'Returns all inventory locations.',
        tags: ['Locations'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Locations retrieved successfully'
            )
        ]
    )]
    /**
     * Display a listing of locations.
     */
    public function index(): JsonResponse
    {
        $locations = Location::withCount('items')
            ->latest()
            ->get();

        return response()->json([
            'data' => $locations,
        ]);
    }

    /**
     * Store a newly created location.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'nullable',
                'string',
                'max:255',
                'unique:locations,name',
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'latitude' => [
                'nullable',
                'numeric',
                'between:-90,90',
                'required_with:longitude',
            ],
            'longitude' => [
                'nullable',
                'numeric',
                'between:-180,180',
                'required_with:latitude',
            ],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $location = Location::create($validated);

        return response()->json([
            'message' => 'Location created successfully.',
            'data' => $location,
        ], 201);
    }

    /**
     * Display the specified location.
     */
    public function show(Location $location): JsonResponse
    {
        $location->load('items');

        return response()->json([
            'data' => $location,
        ]);
    }

    /**
     * Update the specified location.
     */
    public function update(
        Request $request,
        Location $location
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:locations,name,' . $location->id,
            ],
            'description' => [
                'nullable',
                'string',
            ],
        ]);

        $location->update($validated);

        return response()->json([
            'message' => 'Location updated successfully.',
            'data' => $location,
        ]);
    }

    /**
     * Remove the specified location.
     */
    public function destroy(Location $location): JsonResponse
    {
        $location->delete();

        return response()->json([
            'message' => 'Location deleted successfully.',
        ]);
    }
}