<?php

namespace App\Services;

use App\Models\ChatChannel;
use App\Models\ChatMessage;
use App\Models\ChatMessageReaction;
use App\Models\Project;
use App\Models\NotificationPreference;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Notifications\DatabaseNotification;

class ChatService
{
    /**
     * Create the default project chat channel and add all project members.
     */
    public function createProjectChannel(Project $project, int $createdBy): ChatChannel
    {
        return DB::transaction(function () use ($project, $createdBy) {
            $channel = ChatChannel::create([
                'project_id'  => $project->id,
                'name'        => $project->name,
                'type'        => 'project',
                'description' => "General discussion for {$project->name}",
                'created_by'  => $createdBy,
            ]);

            // Add all project members to the channel
            $memberIds = $project->members()->pluck('users.id')->toArray();
            if (!in_array($project->owner_id, $memberIds)) {
                $memberIds[] = $project->owner_id;
            }

            $syncData = [];
            foreach ($memberIds as $memberId) {
                $syncData[$memberId] = [
                    'role' => $memberId === $project->owner_id ? 'admin' : 'member',
                ];
            }
            $channel->members()->sync($syncData);

            // System message
            ChatMessage::create([
                'channel_id' => $channel->id,
                'user_id'    => $createdBy,
                'body'       => "Channel created for project \"{$project->name}\"",
                'type'       => 'system',
            ]);

            return $channel;
        });
    }

    /**
     * Sync project members to channel when members change.
     */
    public function syncProjectMembers(Project $project): void
    {
        $channel = ChatChannel::where('project_id', $project->id)
            ->where('type', 'project')
            ->first();

        if (!$channel) return;

        $memberIds = $project->members()->pluck('users.id')->toArray();
        if (!in_array($project->owner_id, $memberIds)) {
            $memberIds[] = $project->owner_id;
        }

        $existing = $channel->members()->pluck('users.id')->toArray();
        $syncData = [];
        foreach ($memberIds as $id) {
            $syncData[$id] = [
                'role' => $id === $project->owner_id ? 'admin' : 'member',
            ];
        }
        $channel->members()->sync($syncData);
    }

    /**
     * Get channels for a user.
     */
    public function getUserChannels(int $userId): Collection
    {
        return ChatChannel::whereHas('members', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->where('is_archived', false)
            ->with(['project:id,name,color', 'latestMessage.user:id,name,avatar'])
            ->withCount(['messages as unread_count' => function ($q) use ($userId) {
                $q->whereHas('channel.members', function ($mq) use ($userId) {
                    $mq->where('user_id', $userId)
                       ->whereColumn('chat_messages.created_at', '>', 'chat_channel_members.last_read_at');
                });
            }])
            ->orderByDesc(
                ChatMessage::select('created_at')
                    ->whereColumn('channel_id', 'chat_channels.id')
                    ->latest()
                    ->limit(1)
            )
            ->get();
    }

    /**
     * Send a message in a channel.
     */
    public function sendMessage(int $channelId, int $userId, array $data): ChatMessage
    {
        return DB::transaction(function () use ($channelId, $userId, $data) {
            $message = ChatMessage::create([
                'channel_id' => $channelId,
                'user_id'    => $userId,
                'body'       => $data['body'],
                'type'       => $data['type'] ?? 'text',
                'parent_id'  => $data['parent_id'] ?? null,
                'metadata'   => $data['metadata'] ?? null,
                'mentions'   => $data['mentions'] ?? null,
            ]);

            // Update sender's last_read_at
            DB::table('chat_channel_members')
                ->where('channel_id', $channelId)
                ->where('user_id', $userId)
                ->update(['last_read_at' => now()]);

            // Notify mentioned users
            if (!empty($data['mentions'])) {
                $channel = ChatChannel::with('project:id,name')->find($channelId);
                foreach ($data['mentions'] as $mentionedUserId) {
                    if ($mentionedUserId == $userId) continue;
                    if (!NotificationPreference::isEnabled($mentionedUserId, 'chat_mention')) continue;

                    DB::table('notifications')->insert([
                        'id'              => \Illuminate\Support\Str::uuid(),
                        'type'            => 'App\\Notifications\\ChatMention',
                        'notifiable_type' => 'App\\Models\\User',
                        'notifiable_id'   => $mentionedUserId,
                        'data'            => json_encode([
                            'type'         => 'chat_mention',
                            'message'      => "{$message->user->name} mentioned you in #{$channel->name}",
                            'channel_id'   => $channelId,
                            'channel_name' => $channel->name,
                            'message_id'   => $message->id,
                            'sender_id'    => $userId,
                            'project_id'   => $channel->project_id,
                            'project_name' => $channel->project->name ?? null,
                            'preview'      => \Illuminate\Support\Str::limit($data['body'], 80),
                        ]),
                        'created_at'      => now(),
                        'updated_at'      => now(),
                    ]);
                }
            }

            // Notify channel members about new message (except sender and muted members)
            $channel = ChatChannel::find($channelId);
            $membersToNotify = $channel->members()
                ->where('user_id', '!=', $userId)
                ->wherePivot('is_muted', false)
                ->pluck('users.id');

            foreach ($membersToNotify as $memberId) {
                if (!empty($data['mentions']) && in_array($memberId, $data['mentions'])) continue;
                if (!NotificationPreference::isEnabled($memberId, 'chat_message')) continue;

                DB::table('notifications')->insert([
                    'id'              => \Illuminate\Support\Str::uuid(),
                    'type'            => 'App\\Notifications\\ChatMessage',
                    'notifiable_type' => 'App\\Models\\User',
                    'notifiable_id'   => $memberId,
                    'data'            => json_encode([
                        'type'         => 'chat_message',
                        'message'      => "New message in #{$channel->name}",
                        'channel_id'   => $channelId,
                        'channel_name' => $channel->name,
                        'sender_name'  => $message->user->name ?? 'Unknown',
                        'sender_id'    => $userId,
                        'preview'      => \Illuminate\Support\Str::limit($data['body'], 60),
                    ]),
                    'created_at'      => now(),
                    'updated_at'      => now(),
                ]);
            }

            return $message->load('user:id,name,avatar');
        });
    }

    /**
     * Get messages for a channel (paginated, latest first).
     */
    public function getMessages(int $channelId, int $perPage = 50, int $userId = 0): LengthAwarePaginator
    {
        // Mark as read
        if ($userId) {
            DB::table('chat_channel_members')
                ->where('channel_id', $channelId)
                ->where('user_id', $userId)
                ->update(['last_read_at' => now()]);
        }

        return ChatMessage::where('channel_id', $channelId)
            ->with([
                'user:id,name,avatar',
                'replies' => function ($q) {
                    $q->with('user:id,name,avatar')->limit(5);
                },
                'reactions',
            ])
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Edit a message.
     */
    public function editMessage(ChatMessage $message, string $newBody): ChatMessage
    {
        $message->update([
            'body'      => $newBody,
            'edited_at' => now(),
        ]);
        return $message;
    }

    /**
     * Toggle a reaction on a message.
     */
    public function toggleReaction(int $messageId, int $userId, string $emoji): array
    {
        $existing = ChatMessageReaction::where('message_id', $messageId)
            ->where('user_id', $userId)
            ->where('emoji', $emoji)
            ->first();

        if ($existing) {
            $existing->delete();
            return ['action' => 'removed', 'emoji' => $emoji];
        }

        ChatMessageReaction::create([
            'message_id' => $messageId,
            'user_id'    => $userId,
            'emoji'      => $emoji,
        ]);

        return ['action' => 'added', 'emoji' => $emoji];
    }

    /**
     * Pin / unpin a message.
     */
    public function togglePin(ChatMessage $message): ChatMessage
    {
        $message->update(['is_pinned' => !$message->is_pinned]);
        return $message;
    }
}
