<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ItemHistoryController extends Controller
{
    #[OA\Get(
        path: '/api/items/{item}/history',
        operationId: 'getItemHistory',
        summary: 'Get item history',
        description: 'Returns the history of an item belonging to the authenticated user.',
        tags: ['Item History'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Item history retrieved successfully'
            ),
            new OA\Response(
                response: 404,
                description: 'Item not found'
            )
        ]
    )]
    /**
     * Display the history of an item.
     */
    public function index(
        Request $request,
        int $item
    ): JsonResponse {
        $item = $request->user()
            ->items()
            ->findOrFail($item);

        $histories = $item->histories()
            ->with('contact')
            ->latest()
            ->get();

        return response()->json([
            'data' => $histories,
        ]);
    }

    #[OA\Get(
        path: '/api/items/{item}/history/{history}',
        operationId: 'getItemHistoryEntry',
        summary: 'Get a specific history entry',
        description: 'Returns a specific history entry belonging to an item owned by the authenticated user.',
        tags: ['Item History'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'History entry retrieved successfully'
            ),
            new OA\Response(
                response: 404,
                description: 'History entry not found'
            )
        ]
    )]
    /**
     * Display a specific history entry.
     */
    public function show(
        Request $request,
        int $item,
        int $history
    ): JsonResponse {
        $item = $request->user()
            ->items()
            ->findOrFail($item);

        $history = $item->histories()
            ->with('contact')
            ->findOrFail($history);

        return response()->json([
            'data' => $history,
        ]);
    }
}