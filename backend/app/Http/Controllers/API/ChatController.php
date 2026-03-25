<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ChatChannel;
use App\Models\ChatMessage;
use App\Models\User;
use App\Services\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function __construct(
        private readonly ChatService $chatService,
    ) {}

    /**
     * GET /chat/channels — List user's channels
     */
    public function channels(Request $request): JsonResponse
    {
        $channels = $this->chatService->getUserChannels($request->user()->id);

        return response()->json($channels->map(function ($channel) use ($request) {
            return [
                'id'             => $channel->id,
                'name'           => $channel->name,
                'type'           => $channel->type,
                'description'    => $channel->description,
                'project_id'     => $channel->project_id,
                'project'        => $channel->project ? [
                    'id'    => $channel->project->id,
                    'name'  => $channel->project->name,
                    'color' => $channel->project->color,
                ] : null,
                'is_archived'    => $channel->is_archived,
                'unread_count'   => $channel->unreadCountFor($request->user()->id),
                'latest_message' => $channel->latestMessage ? [
                    'body'       => \Illuminate\Support\Str::limit($channel->latestMessage->body, 80),
                    'user'       => $channel->latestMessage->user ? [
                        'id'   => $channel->latestMessage->user->id,
                        'name' => $channel->latestMessage->user->name,
                    ] : null,
                    'created_at' => $channel->latestMessage->created_at->toISOString(),
                ] : null,
                'member_count'   => $channel->members()->count(),
                'created_at'     => $channel->created_at->toISOString(),
            ];
        }));
    }

    /**
     * GET /chat/channels/{channel} — Channel detail with members
     */
    public function show(ChatChannel $channel, Request $request): JsonResponse
    {
        // Ensure user is a member
        if (!$channel->members()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Not a member of this channel'], 403);
        }

        return response()->json([
            'id'          => $channel->id,
            'name'        => $channel->name,
            'type'        => $channel->type,
            'description' => $channel->description,
            'project_id'  => $channel->project_id,
            'is_archived' => $channel->is_archived,
            'members'     => $channel->members->map(fn ($m) => [
                'id'         => $m->id,
                'name'       => $m->name,
                'avatar_url' => $m->avatar_url,
                'role'       => $m->pivot->role,
                'is_muted'   => $m->pivot->is_muted,
            ]),
            'pinned_messages' => $channel->pinnedMessages()
                ->with('user:id,name')
                ->latest()
                ->get()
                ->map(fn ($m) => [
                    'id'   => $m->id,
                    'body' => $m->body,
                    'user' => $m->user ? ['id' => $m->user->id, 'name' => $m->user->name] : null,
                ]),
        ]);
    }

    /**
     * GET /chat/channels/{channel}/messages — Paginated messages
     */
    public function messages(ChatChannel $channel, Request $request): JsonResponse
    {
        if (!$channel->members()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Not a member of this channel'], 403);
        }

        $messages = $this->chatService->getMessages(
            $channel->id,
            $request->integer('per_page', 50),
            $request->user()->id,
        );

        return response()->json($messages);
    }

    /**
     * POST /chat/channels/{channel}/messages — Send a message
     */
    public function sendMessage(ChatChannel $channel, Request $request): JsonResponse
    {
        if (!$channel->members()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Not a member of this channel'], 403);
        }

        $validated = $request->validate([
            'body'      => 'required|string|max:5000',
            'type'      => 'sometimes|in:text,file,task_ref',
            'parent_id' => 'sometimes|nullable|exists:chat_messages,id',
            'metadata'  => 'sometimes|nullable|array',
            'mentions'  => 'sometimes|nullable|array',
            'mentions.*'=> 'integer|exists:users,id',
        ]);

        $message = $this->chatService->sendMessage(
            $channel->id,
            $request->user()->id,
            $validated,
        );

        return response()->json($message, 201);
    }

    /**
     * PUT /chat/messages/{message} — Edit a message
     */
    public function editMessage(ChatMessage $message, Request $request): JsonResponse
    {
        if ($message->user_id !== $request->user()->id) {
            return response()->json(['message' => 'You can only edit your own messages'], 403);
        }

        $validated = $request->validate(['body' => 'required|string|max:5000']);
        $message = $this->chatService->editMessage($message, $validated['body']);

        return response()->json($message);
    }

    /**
     * DELETE /chat/messages/{message} — Delete a message (soft)
     */
    public function deleteMessage(ChatMessage $message, Request $request): JsonResponse
    {
        if ($message->user_id !== $request->user()->id) {
            return response()->json(['message' => 'You can only delete your own messages'], 403);
        }

        $message->delete();
        return response()->json(null, 204);
    }

    /**
     * POST /chat/messages/{message}/react — Toggle reaction
     */
    public function react(ChatMessage $message, Request $request): JsonResponse
    {
        $validated = $request->validate(['emoji' => 'required|string|max:32']);

        $result = $this->chatService->toggleReaction(
            $message->id,
            $request->user()->id,
            $validated['emoji'],
        );

        return response()->json($result);
    }

    /**
     * POST /chat/messages/{message}/pin — Toggle pin
     */
    public function pin(ChatMessage $message, Request $request): JsonResponse
    {
        $message = $this->chatService->togglePin($message);
        return response()->json(['is_pinned' => $message->is_pinned]);
    }

    /**
     * POST /chat/channels/{channel}/mute — Toggle mute
     */
    public function toggleMute(ChatChannel $channel, Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $member = $channel->members()->where('user_id', $userId)->first();

        if (!$member) {
            return response()->json(['message' => 'Not a member'], 403);
        }

        $newMuted = !$member->pivot->is_muted;
        $channel->members()->updateExistingPivot($userId, ['is_muted' => $newMuted]);

        return response()->json(['is_muted' => $newMuted]);
    }

    /**
     * POST /chat/channels/{channel}/read — Mark channel as read
     */
    public function markRead(ChatChannel $channel, Request $request): JsonResponse
    {
        $channel->members()->updateExistingPivot(
            $request->user()->id,
            ['last_read_at' => now()],
        );

        return response()->json(['success' => true]);
    }

    /**
     * POST /chat/channels/{channel}/members
     */
    public function addMembers(Request $request, ChatChannel $channel): JsonResponse
    {
        $request->validate([
            'user_ids'   => 'required|array|min:1',
            'user_ids.*' => 'integer|exists:users,id',
        ]);

        foreach ($request->user_ids as $userId) {
            $channel->members()->syncWithoutDetaching([
                $userId => ['role' => 'member', 'last_read_at' => null, 'is_muted' => false],
            ]);
        }

        return response()->json([
            'message' => 'Members added to channel.',
            'members' => $channel->fresh()->members->map(fn ($m) => [
                'id'         => $m->id,
                'name'       => $m->name,
                'avatar_url' => $m->avatar_url,
                'role'       => $m->pivot->role,
            ]),
        ]);
    }

    /**
     * DELETE /chat/channels/{channel}/members/{user}
     */
    public function removeMember(ChatChannel $channel, User $user): JsonResponse
    {
        $channel->members()->detach($user->id);
        return response()->json(['message' => 'Member removed from channel.']);
    }
}
