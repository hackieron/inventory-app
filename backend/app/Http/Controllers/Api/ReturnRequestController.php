<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Borrowing;
use App\Models\ReturnRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class ReturnRequestController extends Controller
{
    /**
     * Get return requests received by the authenticated user.
     *
     * These are requests for items owned by the authenticated user.
     */
    #[OA\Get(
        path: '/api/return-requests/incoming',
        operationId: 'getIncomingReturnRequests',
        summary: 'Get incoming return requests',
        tags: ['Return Requests'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Incoming return requests retrieved successfully'
            )
        ]
    )]
    public function incoming(Request $request): JsonResponse
    {
        $requests = ReturnRequest::query()
            ->whereHas('borrowing.item', function ($query) use ($request) {
                $query->where('user_id', $request->user()->id);
            })
            ->with([
                'borrowing.item',
                'borrowing.contact',
                'requester',
            ])
            ->latest()
            ->get();

        return response()->json([
            'data' => $requests,
        ]);
    }

    /**
     * Get return requests made by the authenticated user.
     */
    #[OA\Get(
        path: '/api/return-requests/my',
        operationId: 'getMyReturnRequests',
        summary: 'Get my return requests',
        tags: ['Return Requests'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Return requests retrieved successfully'
            )
        ]
    )]
    public function myRequests(Request $request): JsonResponse
    {
        $requests = ReturnRequest::query()
            ->where('requester_id', $request->user()->id)
            ->with([
                'borrowing.item.category',
                'borrowing.item.location',
            ])
            ->latest()
            ->get();

        return response()->json([
            'data' => $requests,
        ]);
    }

    /**
     * Request to return a borrowed item.
     */
    #[OA\Post(
        path: '/api/borrowings/{borrowing}/return-request',
        operationId: 'createReturnRequest',
        summary: 'Request to return an item',
        tags: ['Return Requests'],
        responses: [
            new OA\Response(
                response: 201,
                description: 'Return request created successfully'
            ),
            new OA\Response(
                response: 403,
                description: 'Unauthorized'
            ),
            new OA\Response(
                response: 409,
                description: 'A return request already exists or item is already returned'
            )
        ]
    )]
    public function store(
        Request $request,
        int $borrowing
    ): JsonResponse {
        $borrowing = Borrowing::with([
            'item',
            'contact',
        ])->findOrFail($borrowing);

        /*
         * Make sure the authenticated user is
         * the person who borrowed the item.
         */
        $contact = $borrowing->contact;

        if (
            !$contact ||
            $contact->contact_user_id !== $request->user()->id
        ) {
            return response()->json([
                'message' => 'You are not authorized to return this item.',
            ], 403);
        }

        /*
         * Item must still be borrowed.
         */
        if ($borrowing->returned_at !== null) {
            return response()->json([
                'message' => 'This item has already been returned.',
            ], 409);
        }

        /*
         * Prevent multiple pending return requests.
         */
        $existingRequest = ReturnRequest::query()
            ->where('borrowing_id', $borrowing->id)
            ->where('status', 'pending')
            ->exists();

        if ($existingRequest) {
            return response()->json([
                'message' => 'A return request is already pending.',
            ], 409);
        }

        $validated = $request->validate([
            'notes' => [
                'nullable',
                'string',
            ],
        ]);

        $returnRequest = ReturnRequest::create([
            'borrowing_id' => $borrowing->id,
            'requester_id' => $request->user()->id,
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);

        $returnRequest->load([
            'borrowing.item',
            'requester',
        ]);

        return response()->json([
            'message' => 'Return request sent successfully.',
            'data' => $returnRequest,
        ], 201);
    }

    /**
     * Approve a return request.
     */
    #[OA\Post(
        path: '/api/return-requests/{returnRequest}/approve',
        operationId: 'approveReturnRequest',
        summary: 'Approve return request',
        tags: ['Return Requests'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Return request approved successfully'
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
        int $returnRequest
    ): JsonResponse {
        $returnRequest = ReturnRequest::with([
            'borrowing.item',
            'borrowing.contact',
            'requester',
        ])->findOrFail($returnRequest);

        $borrowing = $returnRequest->borrowing;
        $item = $borrowing->item;

        /*
         * Only the owner of the item can confirm
         * that the item was actually returned.
         */
        if ($item->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'You are not authorized to approve this request.',
            ], 403);
        }

        if ($returnRequest->status !== 'pending') {
            return response()->json([
                'message' => 'This request has already been processed.',
            ], 409);
        }

        if ($borrowing->returned_at !== null) {
            return response()->json([
                'message' => 'This item has already been returned.',
            ], 409);
        }

        $result = DB::transaction(function () use (
            $returnRequest,
            $borrowing,
            $item
        ) {
            /*
             * Mark the actual borrowing as returned.
             */
            $borrowing->update([
                'returned_at' => now(),
            ]);

            /*
             * Mark the item as stored again.
             */
            $item->update([
                'status' => 'stored',
            ]);

            /*
             * Create history record.
             */
            $item->histories()->create([
                'action' => 'returned',
                'description' =>
                    'Item returned by ' . $borrowing->contact->name . '.',
                'old_location' => null,
                'new_location' => $item->location?->name,
                'contact_id' => $borrowing->contact_id,
            ]);

            /*
             * Approve the return request.
             */
            $returnRequest->update([
                'status' => 'approved',
            ]);

            /*
             * Reject any other pending return requests
             * for this borrowing.
             */
            ReturnRequest::query()
                ->where('borrowing_id', $borrowing->id)
                ->where('id', '!=', $returnRequest->id)
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
            'message' => 'Return request approved successfully.',
            'data' => $result,
        ]);
    }

    /**
     * Reject a return request.
     */
    #[OA\Post(
        path: '/api/return-requests/{returnRequest}/reject',
        operationId: 'rejectReturnRequest',
        summary: 'Reject return request',
        tags: ['Return Requests'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Return request rejected successfully'
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
        int $returnRequest
    ): JsonResponse {
        $returnRequest = ReturnRequest::with([
            'borrowing.item',
        ])->findOrFail($returnRequest);

        if (
            $returnRequest->borrowing->item->user_id
            !== $request->user()->id
        ) {
            return response()->json([
                'message' => 'You are not authorized to reject this request.',
            ], 403);
        }

        if ($returnRequest->status !== 'pending') {
            return response()->json([
                'message' => 'This request has already been processed.',
            ], 409);
        }

        $returnRequest->update([
            'status' => 'rejected',
        ]);

        return response()->json([
            'message' => 'Return request rejected successfully.',
            'data' => $returnRequest,
        ]);
    }

    /**
     * Cancel a return request.
     *
     * Only the borrower can cancel it.
     */
    #[OA\Post(
        path: '/api/return-requests/{returnRequest}/cancel',
        operationId: 'cancelReturnRequest',
        summary: 'Cancel return request',
        tags: ['Return Requests'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Return request cancelled successfully'
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
        int $returnRequest
    ): JsonResponse {
        $returnRequest = ReturnRequest::with([
            'borrowing',
        ])->findOrFail($returnRequest);

        if (
            $returnRequest->requester_id
            !== $request->user()->id
        ) {
            return response()->json([
                'message' => 'You are not authorized to cancel this request.',
            ], 403);
        }

        if ($returnRequest->status !== 'pending') {
            return response()->json([
                'message' => 'This request has already been processed.',
            ], 409);
        }

        $returnRequest->update([
            'status' => 'cancelled',
        ]);

        return response()->json([
            'message' => 'Return request cancelled successfully.',
            'data' => $returnRequest,
        ]);
    }
}