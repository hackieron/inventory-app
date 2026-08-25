<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ItemController extends Controller
{
    /**
     * Display a listing of items.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Item::with([
            'category',
            'location',
            'currentBorrowing.contact',
        ]);

        // Search by item name or serial number
        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('serial_number', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by location
        if ($request->filled('location_id')) {
            $query->where('location_id', $request->location_id);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $items = $query
            ->latest()
            ->paginate(20);

        return response()->json($items);
    }

    /**
     * Store a newly created item.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => [
                'nullable',
                'exists:categories,id',
            ],
            'location_id' => [
                'nullable',
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
            'status' => [
                'nullable',
                'string',
                Rule::in([
                    'stored',
                    'borrowed',
                    'lost',
                    'damaged',
                ]),
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

        $item = Item::create($validated);

        $item->load([
            'category',
            'location',
            'currentBorrowing.contact',
        ]);

        return response()->json([
            'message' => 'Item created successfully.',
            'data' => $item,
        ], 201);
    }

    /**
     * Display the specified item.
     */
    public function show(Item $item): JsonResponse
    {
        $item->load([
            'category',
            'location',
            'borrowings.contact',
            'histories.contact',
            'currentBorrowing.contact',
        ]);

        return response()->json([
            'data' => $item,
        ]);
    }

    /**
     * Update the specified item.
     */
    public function update(Request $request, Item $item): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => [
                'nullable',
                'exists:categories,id',
            ],
            'location_id' => [
                'nullable',
                'exists:locations,id',
            ],
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],
            'serial_number' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('items', 'serial_number')
                    ->ignore($item->id),
            ],
            'status' => [
                'nullable',
                'string',
                Rule::in([
                    'stored',
                    'borrowed',
                    'lost',
                    'damaged',
                ]),
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

        $item->update($validated);

        $item->load([
            'category',
            'location',
            'currentBorrowing.contact',
        ]);

        return response()->json([
            'message' => 'Item updated successfully.',
            'data' => $item,
        ]);
    }

    /**
     * Remove the specified item.
     */
    public function destroy(Item $item): JsonResponse
    {
        $item->delete();

        return response()->json([
            'message' => 'Item deleted successfully.',
        ]);
    }
}