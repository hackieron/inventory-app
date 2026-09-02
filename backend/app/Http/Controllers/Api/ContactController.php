<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ContactController extends Controller
{
    #[OA\Get(
        path: '/api/contacts',
        operationId: 'getContacts',
        summary: 'Get all contacts',
        description: 'Returns all contacts belonging to the authenticated user.',
        tags: ['Contacts'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Contacts retrieved successfully'
            )
        ]
    )]
    /**
     * Display a listing of the user's contacts.
     */
    public function index(Request $request): JsonResponse
    {
        $contacts = $request->user()
            ->contacts()
            ->with('contactUser')
            ->withCount('borrowings')
            ->latest()
            ->get();

        return response()->json([
            'data' => $contacts,
        ]);
    }

    #[OA\Post(
        path: '/api/contacts',
        operationId: 'createContact',
        summary: 'Create a contact',
        description: 'Creates a contact for the authenticated user.',
        tags: ['Contacts'],
        responses: [
            new OA\Response(
                response: 201,
                description: 'Contact created successfully'
            ),
            new OA\Response(
                response: 422,
                description: 'Validation error'
            )
        ]
    )]
    /**
     * Store a newly created contact.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contact_user_id' => [
                'nullable',
                'integer',
                'exists:users,id',
                'different:' . $request->user()->id,
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'nullable',
                'email',
                'max:255',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:50',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ]);

        $contact = $request->user()
            ->contacts()
            ->create($validated);

        return response()->json([
            'message' => 'Contact created successfully.',
            'data' => $contact,
        ], 201);
    }

    #[OA\Get(
        path: '/api/contacts/{contact}',
        operationId: 'getContact',
        summary: 'Get a contact',
        description: 'Returns a specific contact belonging to the authenticated user.',
        tags: ['Contacts'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Contact retrieved successfully'
            ),
            new OA\Response(
                response: 404,
                description: 'Contact not found'
            )
        ]
    )]
    /**
     * Display the specified contact.
     */
    public function show(
        Request $request,
        int $contact
    ): JsonResponse {
        $contact = $request->user()
            ->contacts()
            ->withCount('borrowings')
            ->findOrFail($contact);

        return response()->json([
            'data' => $contact,
        ]);
    }

    #[OA\Put(
        path: '/api/contacts/{contact}',
        operationId: 'updateContact',
        summary: 'Update a contact',
        description: 'Updates a contact belonging to the authenticated user.',
        tags: ['Contacts'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Contact updated successfully'
            ),
            new OA\Response(
                response: 404,
                description: 'Contact not found'
            ),
            new OA\Response(
                response: 422,
                description: 'Validation error'
            )
        ]
    )]
    /**
     * Update the specified contact.
     */
    public function update(
        Request $request,
        int $contact
    ): JsonResponse {
        $contact = $request->user()
            ->contacts()
            ->findOrFail($contact);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'nullable',
                'email',
                'max:255',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:50',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ]);

        $contact->update($validated);

        return response()->json([
            'message' => 'Contact updated successfully.',
            'data' => $contact,
        ]);
    }

    #[OA\Delete(
        path: '/api/contacts/{contact}',
        operationId: 'deleteContact',
        summary: 'Delete a contact',
        description: 'Deletes a contact belonging to the authenticated user.',
        tags: ['Contacts'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Contact deleted successfully'
            ),
            new OA\Response(
                response: 404,
                description: 'Contact not found'
            )
        ]
    )]
    /**
     * Remove the specified contact.
     */
    public function destroy(
        Request $request,
        int $contact
    ): JsonResponse {
        $contact = $request->user()
            ->contacts()
            ->findOrFail($contact);

        $contact->delete();

        return response()->json([
            'message' => 'Contact deleted successfully.',
        ]);
    }
}