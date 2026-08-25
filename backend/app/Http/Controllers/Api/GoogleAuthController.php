<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Google\Client as GoogleClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use OpenApi\Attributes as OA;

class GoogleAuthController extends Controller
{
    #[OA\Post(
        path: '/api/auth/google',
        operationId: 'googleLogin',
        summary: 'Authenticate with Google',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['id_token'],
                properties: [
                    new OA\Property(
                        property: 'id_token',
                        type: 'string',
                        description: 'Google ID token received from the mobile application'
                    ),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Google authentication successful'
            ),
            new OA\Response(
                response: 401,
                description: 'Invalid Google token'
            ),
        ]
    )]
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_token' => [
                'required',
                'string',
            ],
        ]);

        $googleClient = new GoogleClient([
            'client_id' => config('services.google.client_id'),
        ]);

        $payload = $googleClient->verifyIdToken(
            $validated['id_token']
        );

        if (!$payload) {
            return response()->json([
                'message' => 'Invalid Google ID token.',
            ], 401);
        }

        $googleId = $payload['sub'];
        $email = $payload['email'];
        $name = $payload['name'] ?? 'Google User';
        $avatar = $payload['picture'] ?? null;

        $user = User::where('google_id', $googleId)
            ->orWhere('email', $email)
            ->first();

        if (!$user) {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'google_id' => $googleId,
                'avatar' => $avatar,
                'email_verified_at' => now(),
                'password' => null,
            ]);
        } else {
            $user->update([
                'google_id' => $user->google_id ?? $googleId,
                'avatar' => $avatar ?? $user->avatar,
                'email_verified_at' => $user->email_verified_at ?? now(),
            ]);
        }

        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'message' => 'Google authentication successful.',
            'user' => $user,
            'token' => $token,
        ]);
    }
}