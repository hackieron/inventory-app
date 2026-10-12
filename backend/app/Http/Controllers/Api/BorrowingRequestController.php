<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Borrowing;
use App\Models\BorrowingRequest;
use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

class BorrowingRequestController extends Controller
{
    /**
     * Get borrowing requests received by the authenticated user.
     *
     * These are requests for items owned by the authenticated user.
     */
    #[OA\Get(
        path: '/api/borrowing-requests/incoming',
        operationId: 'getIncomingBorrowingRequests',
        summary: 'Get incoming borrowing requests',
        tags: ['Borrowing Requests'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Incoming borrowing requests retrieved successfully'
            )
        ]
    )]
    public function incoming(Request $request): JsonResponse
    {
        $requests = BorrowingRequest::query()
            ->whereHas('item', function ($query) use ($request) {
                $query->where('user_id', $request->user()->id);
            })
            ->with([
                'item',
                'requester',
            ])
            ->latest()
            ->get();

        return response()->json([
            'data' => $requests,
        ]);
    }

    /**
     * Get borrowing requests made by the authenticated user.
     */
    #[OA\Get(
        path: '/api/borrowing-requests/my',
        operationId: 'getMyBorrowingRequests',
        summary: 'Get my borrowing requests',
        tags: ['Borrowing Requests'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Borrowing requests retrieved successfully'
            )
        ]
    )]
    public function myRequests(Request $request): JsonResponse
    {
        $requests = BorrowingRequest::query()
            ->where('requester_id', $request->user()->id)
            ->with([
                'item.category',
                'item.location',
            ])
            ->latest()
            ->get();

        return response()->json([
            'data' => $requests,
        ]);
    }

    /**
     * Request to borrow an item.
     */
    #[OA\Post(
        path: '/api/items/{item}/borrowing-request',
        operationId: 'createBorrowingRequest',
        summary: 'Request to borrow an item',
        tags: ['Borrowing Requests'],
        responses: [
            new OA\Response(
                response: 201,
                description: 'Borrowing request created successfully'
            ),
            new OA\Response(
                response: 403,
                description: 'Item is not available for borrowing'
            ),
            new OA\Response(
                response: 409,
                description: 'A request already exists or item is already borrowed'
            )
        ]
    )]
    public function store(
        Request $request,
        int $item
    ): JsonResponse {
        $item = Item::with('category', 'location')
            ->findOrFail($item);

        // Prevent the owner from requesting their own item.
        if ($item->user_id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot request your own item.',
            ], 403);
        }

        // Item must be publicly borrowable.
        if (!$item->is_borrowable) {
            return response()->json([
                'message' => 'This item is not available for borrowing.',
            ], 403);
        }

        // Item cannot already be borrowed.
        if ($item->currentBorrowing()->exists()) {
            return response()->json([
                'message' => 'This item is already borrowed.',
            ], 409);
        }

        $validated = $request->validate([
           

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

        // Prevent multiple pending requests from the same user.
        $existingRequest = BorrowingRequest::query()
            ->where('item_id', $item->id)
            ->where('requester_id', $request->user()->id)
            ->where('status', 'pending')
            ->exists();

        if ($existingRequest) {
            return response()->json([
                'message' => 'You already have a pending request for this item.',
            ], 409);
        }

        $borrowingRequest = BorrowingRequest::create([
            'item_id' => $item->id,
            'requester_id' => $request->user()->id,
            'expected_return_at' =>
                $validated['expected_return_at'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        $borrowingRequest->load([
            'item',
            'requester',
        ]);

        return response()->json([
            'message' => 'Borrowing request sent successfully.',
            'data' => $borrowingRequest,
        ], 201);
    }

    /**
     * Approve a borrowing request.
     *
     * This creates the actual Borrowing record.
     */
    #[OA\Post(
        path: '/api/borrowing-requests/{borrowingRequest}/approve',
        operationId: 'approveBorrowingRequest',
        summary: 'Approve borrowing request',
        tags: ['Borrowing Requests'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Borrowing request approved successfully'
            ),
            new OA\Response(
                response: 403,
                description: 'Unauthorized'
            ),
            new OA\Response(
                response: 409,
                description: 'Request cannot be approved'
            )
        ]
    )]
    public function approve(
        Request $request,
        int $borrowingRequest
    ): JsonResponse {
        $borrowingRequest = BorrowingRequest::with([
            'item',
            'requester',
        ])->findOrFail($borrowingRequest);

        // Only the item owner can approve.
        if ($borrowingRequest->item->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'You are not authorized to approve this request.',
            ], 403);
        }

        // Must still be pending.
        if ($borrowingRequest->status !== 'pending') {
            return response()->json([
                'message' => 'This request has already been processed.',
            ], 409);
        }

        // Item must still be borrowable.
        if (!$borrowingRequest->item->is_borrowable) {
            return response()->json([
                'message' => 'This item is no longer available for borrowing.',
            ], 409);
        }

        // Item cannot already be borrowed.
        if ($borrowingRequest->item->currentBorrowing()->exists()) {
            return response()->json([
                'message' => 'This item is already borrowed.',
            ], 409);
        }

        /*
         * Find the owner's Contact record
         * representing the requesting user.
         */
        $contact = $request->user()
            ->contacts()
            ->where(
                'contact_user_id',
                $borrowingRequest->requester_id
            )
            ->first();

        if (!$contact) {
            $requester = $borrowingRequest->requester;

            $contact = $request->user()
                ->contacts()
                ->create([
                    'contact_user_id' => $requester->id,
                    'name' => $requester->name,
                    'email' => $requester->email,
                ]);
        }

        $result = DB::transaction(function () use ($borrowingRequest, $contact) {
            $item = $borrowingRequest->item;

            $borrowing = $item->borrowings()->create([
                'contact_id' => $contact->id,
                'borrowed_at' => now(),
                'expected_return_at' =>
                    $borrowingRequest->expected_return_at,
                'notes' => $borrowingRequest->notes,
            ]);

            $item->update([
                'status' => 'borrowed',
            ]);

            $item->histories()->create([
                'action' => 'borrowed',
                'description' =>
                    'Item borrowed by ' . $contact->name . '.',
                'old_location' => $item->location?->name,
                'new_location' => null,
                'contact_id' => $contact->id,
            ]);

            $borrowingRequest->update([
                'status' => 'approved',
            ]);

            // Reject other pending requests.
            BorrowingRequest::query()
                ->where('item_id', $item->id)
                ->where('id', '!=', $borrowingRequest->id)
                ->where('status', 'pending')
                ->update([
                    'status' => 'rejected',
                ]);

            return $borrowing;
        });

        $result->load([
            'item',
            'contact',
        ]);

        return response()->json([
            'message' => 'Borrowing request approved successfully.',
            'data' => $result,
        ]);
    }

    /**
     * Reject a borrowing request.
     */
    #[OA\Post(
        path: '/api/borrowing-requests/{borrowingRequest}/reject',
        operationId: 'rejectBorrowingRequest',
        summary: 'Reject borrowing request',
        tags: ['Borrowing Requests'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Borrowing request rejected successfully'
            ),
            new OA\Response(
                response: 403,
                description: 'Unauthorized'
            ),
            new OA\Response(
                response: 409,
                description: 'Request has already been processed'
            )
        ]
    )]
    public function reject(
        Request $request,
        int $borrowingRequest
    ): JsonResponse {
        $borrowingRequest = BorrowingRequest::with('item')
            ->findOrFail($borrowingRequest);

        if ($borrowingRequest->item->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'You are not authorized to reject this request.',
            ], 403);
        }

        if ($borrowingRequest->status !== 'pending') {
            return response()->json([
                'message' => 'This request has already been processed.',
            ], 409);
        }

        $borrowingRequest->update([
            'status' => 'rejected',
        ]);

        return response()->json([
            'message' => 'Borrowing request rejected successfully.',
            'data' => $borrowingRequest,
        ]);
    }

    /**
     * Cancel a borrowing request.
     *
     * Only the requester can cancel it.
     */
    #[OA\Post(
        path: '/api/borrowing-requests/{borrowingRequest}/cancel',
        operationId: 'cancelBorrowingRequest',
        summary: 'Cancel borrowing request',
        tags: ['Borrowing Requests'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Borrowing request cancelled successfully'
            ),
            new OA\Response(
                response: 403,
                description: 'Unauthorized'
            ),
            new OA\Response(
                response: 409,
                description: 'Request has already been processed'
            )
        ]
    )]
    public function cancel(
        Request $request,
        int $borrowingRequest
    ): JsonResponse {
        $borrowingRequest = BorrowingRequest::findOrFail(
            $borrowingRequest
        );

        if ($borrowingRequest->requester_id !== $request->user()->id) {
            return response()->json([
                'message' => 'You are not authorized to cancel this request.',
            ], 403);
        }

        if ($borrowingRequest->status !== 'pending') {
            return response()->json([
                'message' => 'This request has already been processed.',
            ], 409);
        }

        $borrowingRequest->update([
            'status' => 'cancelled',
        ]);

        return response()->json([
            'message' => 'Borrowing request cancelled successfully.',
            'data' => $borrowingRequest,
        ]);
    }
}