<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ChatMessage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'channel_id', 'user_id', 'parent_id', 'body', 'type',
        'metadata', 'mentions', 'is_pinned', 'edited_at',
    ];

    protected $casts = [
        'metadata'  => 'array',
        'mentions'  => 'array',
        'is_pinned' => 'boolean',
        'edited_at' => 'datetime',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function channel()
    {
        return $this->belongsTo(ChatChannel::class, 'channel_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parent()
    {
        return $this->belongsTo(ChatMessage::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(ChatMessage::class, 'parent_id')->oldest();
    }

    public function reactions()
    {
        return $this->hasMany(ChatMessageReaction::class, 'message_id');
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function isEdited(): bool
    {
        return $this->edited_at !== null;
    }

    public function getMentionedUsers()
    {
        if (empty($this->mentions)) return collect();
        return User::whereIn('id', $this->mentions)->get();
    }
}
