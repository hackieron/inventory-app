<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
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
        $contactUserIds = $request->user()
            ->contacts()
            ->whereNotNull('contact_user_id')
            ->whereHas('contactUser.contacts', function ($query) use ($request) {
                $query->where('contact_user_id', $request->user()->id);
            })
            ->pluck('contact_user_id');

        $items = Item::query()
            ->where('user_id', '!=', $request->user()->id)
            ->whereIn('user_id', $contactUserIds)
            ->whereDoesntHave('borrowingRequests', function ($query) use ($request) {
                $query
                    ->where('requester_id', $request->user()->id)
                    ->where('status', 'pending');
            })
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
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120', // 5 MB
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

        // Keep item images on the private local disk. The database stores only
        // the generated path, never a client-supplied filename.
        unset($validated['image']);
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('items', 'local');
        }

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

    /**
     * Stream an item image only to an authorized authenticated user.
     */
    public function image(Request $request, int $item)
    {
        $item = Item::query()->findOrFail($item);
        $isOwner = $item->user_id === $request->user()->id;
        $isBorrowablePreview = $item->is_borrowable && $item->status === 'stored';
        $hasAccess = $isOwner || $isBorrowablePreview;
        $hasStoredFile = (bool) $item->image
            && Storage::disk('local')->exists($item->image);

        Log::info('Item image request', [
            'item_id' => $item->id,
            'item_owner_id' => $item->user_id,
            'authenticated_user_id' => $request->user()->id,
            'image_path' => $item->image,
            'stored_file_exists' => $hasStoredFile,
            'is_owner' => $isOwner,
            'is_borrowable_preview' => $isBorrowablePreview,
            'has_access' => $hasAccess,
        ]);

        if (!$hasAccess) {
            Log::warning('Item image access denied', [
                'item_id' => $item->id,
                'item_owner_id' => $item->user_id,
                'authenticated_user_id' => $request->user()->id,
            ]);

            abort(403);
        }

        if (!$hasStoredFile) {
            Log::warning('Item image file missing', [
                'item_id' => $item->id,
                'image_path' => $item->image,
                'storage_root' => config('filesystems.disks.local.root'),
            ]);

            abort(404);
        }

        return Storage::disk('local')->response($item->image);
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

        $original = $item->getRawOriginal();
        $oldCategory = $item->category?->name;
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
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
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

        unset($validated['image']);
        if ($request->hasFile('image')) {
            $newImage = $request->file('image')->store('items', 'local');

            if ($item->image) {
                Storage::disk('local')->delete($item->image);
            }

            $validated['image'] = $newImage;
        }

        // Update the item
        $item->update($validated);

        // Reload related display values after the update.
        $item->load([
            'category',
            'location',
        ]);

        $newCategory = $item->category?->name;
        $newLocation = $item->location?->name;

        $labels = [
            'name' => 'Name',
            'serial_number' => 'Serial number',
            'purchase_date' => 'Purchase date',
            'description' => 'Description',
            'notes' => 'Notes',
            'category_id' => 'Category',
            'location_id' => 'Location',
        ];
        $changes = [];
        $formatValue = static fn ($value): string =>
            $value === null || $value === '' ? 'empty' : (string) $value;

        foreach ($item->getChanges() as $field => $newValue) {
            if ($field === 'updated_at') {
                continue;
            }

            if ($field === 'image') {
                $changes[] = 'Photo updated.';
                continue;
            }

            if (!array_key_exists($field, $labels)) {
                continue;
            }

            $oldValue = $original[$field] ?? null;
            $displayOld = match ($field) {
                'category_id' => $oldCategory ?? 'empty',
                'location_id' => $oldLocation ?? 'empty',
                default => $formatValue($oldValue),
            };
            $displayNew = match ($field) {
                'category_id' => $newCategory ?? 'empty',
                'location_id' => $newLocation ?? 'empty',
                default => $formatValue($newValue),
            };

            $changes[] = "{$labels[$field]}: {$displayOld} -> {$displayNew}";
        }

        if ($changes !== []) {
            $item->histories()->create([
                'action' => 'updated',
                'description' => implode("\n", $changes),
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
