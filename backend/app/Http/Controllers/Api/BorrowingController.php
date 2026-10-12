<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Borrowing;
use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

class BorrowingController extends Controller
{
    #[OA\Post(
        path: '/api/items/{item}/borrow',
        operationId: 'borrowItem',
        summary: 'Borrow an item',
        description: 'Creates a borrowing record for an item owned by the authenticated user.',
        tags: ['Borrowings'],
        responses: [
            new OA\Response(
                response: 201,
                description: 'Item borrowed successfully'
            ),
            new OA\Response(
                response: 404,
                description: 'Item not found'
            ),
            new OA\Response(
                response: 409,
                description: 'Item is already borrowed'
            ),
            new OA\Response(
                response: 422,
                description: 'Validation error'
            )
        ]
    )]
    /**
     * Borrow an item.
     */
    public function borrow(Request $request, int $item): JsonResponse
    {
        $item = $request->user()
            ->items()
            ->findOrFail($item);

        $validated = $request->validate([
            'contact_id' => [
                'required',
                'integer',
                Rule::exists('contacts', 'id')
                    ->where('user_id', $request->user()->id),
            ],

            'expected_return_at' => [
                'nullable',
                'date',
                'after_or_equal:now',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ]);

        /*
         * Prevent an item from being borrowed by
         * multiple people at the same time.
         */
        if ($item->currentBorrowing()->exists()) {
            return response()->json([
                'message' => 'This item is already borrowed.',
            ], 409);
        }

        /*
         * Create the borrowing record.
         */
        $borrowing = $item->borrowings()->create([
            'contact_id' => $validated['contact_id'],
            'borrowed_at' => now(),
            'expected_return_at' => $validated['expected_return_at'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        /*
         * Update item status.
         */
        $item->update([
            'status' => 'borrowed',
        ]);

        /*
         * Create item history.
         */
        $item->histories()->create([
            'action' => 'borrowed',
            'description' => 'Item borrowed.',
            'contact_id' => $borrowing->contact_id,
        ]);

        /*
         * Load relationships for response.
         */
        $borrowing->load([
            'item',
            'contact',
        ]);

        return response()->json([
            'message' => 'Item borrowed successfully.',
            'data' => $borrowing,
        ], 201);
    }

    #[OA\Post(
        path: '/api/borrowings/{borrowing}/return',
        operationId: 'returnItem',
        summary: 'Return an item',
        description: 'Marks an active borrowing as returned.',
        tags: ['Borrowings'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Item returned successfully'
            ),
            new OA\Response(
                response: 404,
                description: 'Borrowing not found'
            ),
            new OA\Response(
                response: 409,
                description: 'Item has already been returned'
            )
        ]
    )]
    /**
     * Return an item.
     */
    public function returnItem(
        Request $request,
        int $borrowing
    ): JsonResponse {
        $borrowing = Borrowing::with('item')
            ->whereHas('item', function ($query) use ($request) {
                $query->where('user_id', $request->user()->id);
            })
            ->findOrFail($borrowing);

        if ($borrowing->returned_at !== null) {
            return response()->json([
                'message' => 'This item has already been returned.',
            ], 409);
        }

        /*
         * Mark borrowing as returned.
         */
        $borrowing->update([
            'returned_at' => now(),
        ]);

        /*
         * Update item status.
         */
        $borrowing->item->update([
            'status' => 'stored',
        ]);

        /*
         * Create item history.
         */
        $borrowing->item->histories()->create([
            'action' => 'returned',
            'description' => 'Item returned.',
            'contact_id' => $borrowing->contact_id,
        ]);

        /*
         * Load relationships for response.
         */
        $borrowing->load([
            'item',
            'contact',
        ]);

        return response()->json([
            'message' => 'Item returned successfully.',
            'data' => $borrowing,
        ]);
    }

    #[OA\Get(
        path: '/api/items/{item}/borrowings',
        operationId: 'getItemBorrowings',
        summary: 'Get item borrowing history',
        description: 'Returns the borrowing history of an item owned by the authenticated user.',
        tags: ['Borrowings'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Borrowing history retrieved successfully'
            ),
            new OA\Response(
                response: 404,
                description: 'Item not found'
            )
        ]
    )]
    /**
     * Get borrowing history for an item.
     */
    public function itemBorrowings(
        Request $request,
        int $item
    ): JsonResponse {
        $item = $request->user()
            ->items()
            ->findOrFail($item);

        $borrowings = $item->borrowings()
            ->with('contact')
            ->latest('borrowed_at')
            ->get();

        return response()->json([
            'data' => $borrowings,
        ]);
    }
    #[OA\Get(
        path: '/api/borrowings',
        operationId: 'getMyBorrowings',
        summary: 'Get items borrowed by the authenticated user',
        description: 'Returns all active and previous borrowings where the contact represents the authenticated user.',
        tags: ['Borrowings'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Borrowings retrieved successfully'
            )
        ]
    )]
    public function myBorrowings(Request $request): JsonResponse
    {
        $borrowings = Borrowing::query()
            ->whereHas('contact', function ($query) use ($request) {
                $query->where(
                    'contact_user_id',
                    $request->user()->id
                );
            })
            ->with([
                'item.category',
                'item.location',
                'contact',
            ])
            ->latest('borrowed_at')
            ->get();

        return response()->json([
            'data' => $borrowings,
        ]);
    }
    #[OA\Get(
        path: '/api/borrowings/{borrowing}',
        operationId: 'getBorrowing',
        summary: 'Get a borrowing',
        description: 'Returns a specific borrowing belonging to an item owned by the authenticated user.',
        tags: ['Borrowings'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Borrowing retrieved successfully'
            ),
            new OA\Response(
                response: 404,
                description: 'Borrowing not found'
            )
        ]
    )]
    /**
     * Display a specific borrowing.
     */
    public function show(
        Request $request,
        int $borrowing
    ): JsonResponse {
        $borrowing = Borrowing::with([
            'item.category',
            'item.location',
            'contact',
        ])
            ->whereHas('item', function ($query) use ($request) {
                $query->where('user_id', $request->user()->id);
            })
            ->findOrFail($borrowing);

        return response()->json([
            'data' => $borrowing,
        ]);
    }


    public function request(
        Request $request,
        int $item
    ): JsonResponse {
        $item = Item::findOrFail($item);

        // Item must allow borrowing requests
        if (!$item->is_borrowable) {
            return response()->json([
                'message' => 'This item is not available for borrowing.',
            ], 403);
        }

        // Item cannot already be borrowed
        if ($item->currentBorrowing()->exists()) {
            return response()->json([
                'message' => 'This item is already borrowed.',
            ], 409);
        }

        $validated = $request->validate([
            'contact_id' => [
                'required',
                'integer',
                'exists:contacts,id',
            ],

            'expected_return_at' => [
                'nullable',
                'date',
                'after_or_equal:now',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ]);

        // Prevent duplicate pending requests
        $existingRequest = $item->borrowings()
            ->where('contact_id', $validated['contact_id'])
            ->where('status', 'pending')
            ->exists();

        if ($existingRequest) {
            return response()->json([
                'message' => 'You already have a pending request for this item.',
            ], 409);
        }

        $borrowing = $item->borrowings()->create([
            'contact_id' => $validated['contact_id'],
            'status' => 'pending',
            'borrowed_at' => null,
            'expected_return_at' => $validated['expected_return_at'] ?? null,
            'returned_at' => null,
            'notes' => $validated['notes'] ?? null,
        ]);

        $borrowing->load([
            'item',
            'contact',
        ]);

        return response()->json([
            'message' => 'Borrow request sent successfully.',
            'data' => $borrowing,
        ], 201);
    }
}