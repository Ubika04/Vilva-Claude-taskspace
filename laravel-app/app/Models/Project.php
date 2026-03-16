<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'description', 'slug', 'color', 'icon',
        'status', 'visibility', 'start_date', 'due_date',
        'progress', 'owner_id', 'settings',
    ];

    protected $casts = [
        'start_date' => 'date',
        'due_date'   => 'date',
        'settings'   => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (Project $project) {
            if (empty($project->slug)) {
                $project->slug = Str::slug($project->name) . '-' . Str::random(6);
            }
        });
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'project_members')->withPivot('role_id', 'joined_at');
    }

    public function projectMembers()
    {
        return $this->hasMany(ProjectMember::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function rootTasks()
    {
        return $this->hasMany(Task::class)->whereNull('parent_id');
    }

    public function tags()
    {
        return $this->hasMany(Tag::class);
    }

    public function activityLogs()
    {
        return $this->morphMany(ActivityLog::class, 'subject');
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function recalculateProgress(): void
    {
        $total     = $this->tasks()->whereNull('parent_id')->count();
        $completed = $this->tasks()->whereNull('parent_id')->where('status', 'completed')->count();
        $this->progress = $total > 0 ? round(($completed / $total) * 100) : 0;
        $this->saveQuietly();
    }
}
