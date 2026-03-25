<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatChannel extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id', 'name', 'type', 'description', 'created_by', 'is_archived',
    ];

    protected $casts = [
        'is_archived' => 'boolean',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'chat_channel_members', 'channel_id')
            ->withPivot('role', 'last_read_at', 'is_muted')
            ->withTimestamps();
    }

    public function messages()
    {
        return $this->hasMany(ChatMessage::class, 'channel_id');
    }

    public function latestMessage()
    {
        return $this->hasOne(ChatMessage::class, 'channel_id')->latest();
    }

    public function pinnedMessages()
    {
        return $this->hasMany(ChatMessage::class, 'channel_id')->where('is_pinned', true);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function unreadCountFor(int $userId): int
    {
        $member = $this->members()->where('user_id', $userId)->first();
        if (!$member || !$member->pivot->last_read_at) {
            return $this->messages()->count();
        }
        return $this->messages()
            ->where('created_at', '>', $member->pivot->last_read_at)
            ->where('user_id', '!=', $userId)
            ->count();
    }

    public function addMember(int $userId, string $role = 'member'): void
    {
        $this->members()->syncWithoutDetaching([
            $userId => ['role' => $role],
        ]);
    }

    public function removeMember(int $userId): void
    {
        $this->members()->detach($userId);
    }
}
