<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name', 'email', 'password', 'avatar', 'timezone', 'locale',
        'status', 'last_active_at', 'mobile', 'department', 'designation',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $appends = ['avatar_url'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_active_at'    => 'datetime',
        'password'          => 'hashed',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    public function projectMembers()
    {
        return $this->hasMany(ProjectMember::class);
    }

    public function projects()
    {
        return $this->belongsToMany(Project::class, 'project_members');
    }

    public function ownedProjects()
    {
        return $this->hasMany(Project::class, 'owner_id');
    }

    public function assignedTasks()
    {
        return $this->belongsToMany(Task::class, 'task_assignments');
    }

    public function timeLogs()
    {
        return $this->hasMany(TaskTimeLog::class);
    }

    public function activeTimer()
    {
        return $this->hasOne(TaskTimeLog::class)->whereIn('status', ['active', 'paused']);
    }

    public function chatChannels()
    {
        return $this->belongsToMany(ChatChannel::class, 'chat_channel_members', 'user_id', 'channel_id')
            ->withPivot('role', 'last_read_at', 'is_muted');
    }

    public function workSessions()
    {
        return $this->hasMany(WorkSession::class);
    }

    public function activeWorkSession()
    {
        return $this->hasOne(WorkSession::class)->whereIn('status', ['active', 'on_break']);
    }

    public function notificationPreferences()
    {
        return $this->hasMany(NotificationPreference::class);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function hasPermission(string $permission): bool
    {
        return $this->roles()
            ->whereHas('permissions', fn($q) => $q->where('name', $permission))
            ->exists();
    }

    public function hasRole(string $role): bool
    {
        return $this->roles()->where('name', $role)->exists();
    }

    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            try {
                return \Storage::url($this->avatar);
            } catch (\Throwable) {
                // S3 / storage not configured — fall through to generated avatar
            }
        }
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&background=6366f1&color=fff&size=64';
    }
}
