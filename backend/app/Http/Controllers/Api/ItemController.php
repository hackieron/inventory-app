<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ItemController extends Controller
{

    #[OA\Get(
        path: '/api/items',
        operationId: 'getItems',
        summary: 'Get all items',
        description: 'Returns all inventory items belonging to the authenticated user.',
        tags: ['Items'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Items retrieved successfully'
            )
        ]
    )]
    /**
     * Display a listing of the user's items.
     */
    public function index(Request $request): JsonResponse
    {
        $items = $request->user()
            ->items()
            ->with([
                'category',
                'location',
                'currentBorrowing.contact',
            ])
            ->latest()
            ->get();

        return response()->json([
            'data' => $items,
        ]);
    }
    public function discover(Request $request): JsonResponse
    {
        $items = Item::query()
            ->where('is_borrowable', true)
            ->where('status', 'stored')
            ->with([
                'category',
                'location',
                'currentBorrowing.contact',
            ])
            ->latest()
            ->get();

        return response()->json([
            'data' => $items,
        ]);
    }
    #[OA\Post(
        path: '/api/items',
        operationId: 'createItem',
        summary: 'Create a new item',
        description: 'Creates a new inventory item for the authenticated user.',
        tags: ['Items'],
        responses: [
            new OA\Response(
                response: 201,
                description: 'Item created successfully'
            ),
            new OA\Response(
                response: 422,
                description: 'Validation error'
            )
        ]
    )]
    /**
     * Store a newly created item.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => [
                'nullable',
                'integer',
                'exists:categories,id',
            ],

            'location_id' => [
                'nullable',
                'integer',
                'exists:locations,id',
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'serial_number' => [
                'nullable',
                'string',
                'max:255',
                'unique:items,serial_number',
            ],

            'purchase_date' => [
                'nullable',
                'date',
            ],

            'image' => [
                'nullable',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
            'is_borrowable' =>
                'integer'
        ]);

        /*
         * New items always start as "stored".
         * Borrowing will handle the borrowed status later.
         */
        $validated['status'] = 'stored';

        $item = $request->user()
            ->items()
            ->create($validated);

        $item->load([
            'category',
            'location',
        ]);

        return response()->json([
            'message' => 'Item created successfully.',
            'data' => $item,
        ], 201);
    }

    #[OA\Get(
        path: '/api/items/{item}',
        operationId: 'getItem',
        summary: 'Get a specific item',
        description: 'Returns a specific inventory item belonging to the authenticated user.',
        tags: ['Items'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Item retrieved successfully'
            ),
            new OA\Response(
                response: 404,
                description: 'Item not found'
            )
        ]
    )]
    /**
     * Display the specified item.
     */
    public function show(
        Request $request,
        int $item
    ): JsonResponse {
        $item = $request->user()
            ->items()
            ->with([
                'category',
                'location',
                'currentBorrowing.contact',
                'histories.contact',
            ])
            ->findOrFail($item);

        return response()->json([
            'data' => $item,
        ]);
    }

    #[OA\Put(
        path: '/api/items/{item}',
        operationId: 'updateItem',
        summary: 'Update an item',
        description: 'Updates an inventory item belonging to the authenticated user.',
        tags: ['Items'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Item updated successfully'
            ),
            new OA\Response(
                response: 404,
                description: 'Item not found'
            ),
            new OA\Response(
                response: 422,
                description: 'Validation error'
            )
        ]
    )]
    /**
     * Update the specified item.
     */
    /**
     * Update the specified item.
     */
    public function update(
        Request $request,
        int $item
    ): JsonResponse {
        $item = $request->user()
            ->items()
            ->findOrFail($item);

        // Get the current location before updating
        $oldLocation = $item->location?->name;

        $validated = $request->validate([
            'category_id' => [
                'nullable',
                'integer',
                'exists:categories,id',
            ],

            'location_id' => [
                'nullable',
                'integer',
                'exists:locations,id',
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'serial_number' => [
                'nullable',
                'string',
                'max:255',
                'unique:items,serial_number,' . $item->id,
            ],

            'purchase_date' => [
                'nullable',
                'date',
            ],

            'image' => [
                'nullable',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ]);

        // Update the item
        $item->update($validated);

        // Reload the new location
        $item->load([
            'category',
            'location',
        ]);

        // Get the new location
        $newLocation = $item->location?->name;

        // Create history only if the location changed
        if ($oldLocation !== $newLocation) {

            $description = match (true) {
                $oldLocation && $newLocation =>
                "Item moved from {$oldLocation} to {$newLocation}.",

                $oldLocation && !$newLocation =>
                "Item removed from {$oldLocation}.",

                !$oldLocation && $newLocation =>
                "Item assigned to {$newLocation}.",

                default =>
                "Item location updated.",
            };

            $item->histories()->create([
                'action' => 'moved',
                'description' => $description,
                'old_location' => $oldLocation,
                'new_location' => $newLocation,
            ]);
        }

        return response()->json([
            'message' => 'Item updated successfully.',
            'data' => $item,
        ]);
    }

    #[OA\Delete(
        path: '/api/items/{item}',
        operationId: 'deleteItem',
        summary: 'Delete an item',
        description: 'Deletes an inventory item belonging to the authenticated user.',
        tags: ['Items'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Item deleted successfully'
            ),
            new OA\Response(
                response: 404,
                description: 'Item not found'
            )
        ]
    )]
    /**
     * Remove the specified item.
     */
    public function destroy(
        Request $request,
        int $item
    ): JsonResponse {
        $item = $request->user()
            ->items()
            ->findOrFail($item);

        $item->delete();

        return response()->json([
            'message' => 'Item deleted successfully.',
        ]);
    }


    public function makeItemBorrowable($id)
    {
        $item = Item::findOrFail($id);

        $item->update([
            'is_borrowable' => !$item->is_borrowable,
        ]);

        return response()->json([
            'message' => "Item is now " . ($item->is_borrowable ? 'borrowable' : 'not borrowable'),
            'is_borrowable' => $item->is_borrowable,
        ]);
    }   
}