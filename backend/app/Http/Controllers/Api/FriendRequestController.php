<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FriendRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class FriendRequestController extends Controller
{
    public function avatar(Request $request, User $user)
    {
        abort_unless(
            $request->user()->contacts()->where('contact_user_id', $user->id)->exists()
                && $user->avatar
                && Storage::disk('local')->exists($user->avatar),
            404
        );

        return response()->file(Storage::disk('local')->path($user->avatar));
    }
    public function users(Request $request): JsonResponse
    {
        $query = trim((string) $request->query('query', ''));

        if (mb_strlen($query) < 2) {
            return response()->json(['data' => []]);
        }

        $users = User::query()
            ->where('id', '!=', $request->user()->id)
            ->where(fn ($builder) => $builder
                ->where('name', 'like', '%' . $query . '%')
                ->orWhere('email', 'like', '%' . $query . '%'))
            ->select(['id', 'name', 'email', 'avatar'])
            ->limit(20)
            ->get();

        return response()->json(['data' => $users]);
    }

    public function sent(Request $request): JsonResponse
    {
        return response()->json([
            'data' => FriendRequest::query()
                ->where('sender_id', $request->user()->id)
                ->with('receiver:id,name,email,avatar')
                ->latest()
                ->get(),
        ]);
    }

    public function incoming(Request $request): JsonResponse
    {
        return response()->json([
            'data' => FriendRequest::query()
                ->where('receiver_id', $request->user()->id)
                ->with('sender:id,name,email,avatar')
                ->latest()
                ->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'receiver_id' => ['required', 'integer', 'exists:users,id', 'different:' . $request->user()->id],
        ]);

        $existing = FriendRequest::query()
            ->where(fn ($query) => $query
                ->where('sender_id', $request->user()->id)
                ->where('receiver_id', $validated['receiver_id']))
            ->orWhere(fn ($query) => $query
                ->where('sender_id', $validated['receiver_id'])
                ->where('receiver_id', $request->user()->id))
            ->latest()
            ->first();

        if ($existing?->status === 'accepted') {
            return response()->json(['message' => 'You are already connected.'], 409);
        }

        if ($existing?->status === 'pending') {
            return response()->json(['message' => 'A friend request is already pending.'], 409);
        }

        $friendRequest = FriendRequest::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => $validated['receiver_id'],
            'status' => 'pending',
        ])->load('receiver:id,name,email,avatar');

        return response()->json([
            'message' => 'Friend request sent successfully.',
            'data' => $friendRequest,
        ], 201);
    }

    public function update(Request $request, int $friendRequest): JsonResponse
    {
        $validated = $request->validate(['status' => ['required', 'in:accepted,rejected']]);

        $result = DB::transaction(function () use ($request, $friendRequest, $validated) {
            $friendRequest = FriendRequest::query()
                ->whereKey($friendRequest)
                ->lockForUpdate()
                ->firstOrFail();

            if ($friendRequest->receiver_id !== $request->user()->id) {
                abort(403, 'Only the recipient can respond to this request.');
            }

            if ($friendRequest->status !== 'pending') {
                abort(409, 'This friend request has already been resolved.');
            }

            $friendRequest->update(['status' => $validated['status']]);

            if ($validated['status'] === 'accepted') {
                $sender = User::findOrFail($friendRequest->sender_id);
                $receiver = User::findOrFail($friendRequest->receiver_id);

                $this->createContactIfMissing($sender, $receiver);
                $this->createContactIfMissing($receiver, $sender);
            }

            return $friendRequest->load([
                'sender:id,name,email,avatar',
                'receiver:id,name,email,avatar',
            ]);
        });

        return response()->json([
            'message' => 'Friend request ' . $validated['status'] . ' successfully.',
            'data' => $result,
        ]);
    }

    private function createContactIfMissing(User $owner, User $friend): void
    {
        $owner->contacts()->firstOrCreate(
            ['contact_user_id' => $friend->id],
            [
                'name' => $friend->name,
                'email' => $friend->email,
            ],
        );
    }
}
