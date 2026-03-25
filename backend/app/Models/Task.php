<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'project_id', 'parent_id', 'created_by', 'title', 'description',
        'status', 'priority', 'task_type', 'due_date', 'start_date',
        'timebox_start', 'timebox_end', 'position',
        'estimated_minutes', 'total_time_spent', 'is_archived',
        'is_reviewed', 'score', 'completed_at', 'custom_fields',
    ];

    protected $casts = [
        'due_date'       => 'date',
        'start_date'     => 'date',
        'timebox_start'  => 'datetime',
        'timebox_end'    => 'datetime',
        'completed_at'   => 'datetime',
        'is_archived'    => 'boolean',
        'is_reviewed'    => 'boolean',
        'custom_fields'  => 'array',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function parent()
    {
        return $this->belongsTo(Task::class, 'parent_id');
    }

    public function subtasks()
    {
        return $this->hasMany(Task::class, 'parent_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignees()
    {
        return $this->belongsToMany(User::class, 'task_assignments');
    }

    public function watchers()
    {
        return $this->belongsToMany(User::class, 'task_watchers');
    }

    public function reviewers()
    {
        return $this->belongsToMany(User::class, 'task_reviewers')
            ->withPivot('review_status', 'review_note', 'reviewed_at');
    }

    public function comments()
    {
        return $this->hasMany(TaskComment::class)->whereNull('parent_id')->latest();
    }

    public function attachments()
    {
        return $this->hasMany(TaskAttachment::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'task_tags');
    }

    public function timeLogs()
    {
        return $this->hasMany(TaskTimeLog::class);
    }

    public function activeTimers()
    {
        return $this->hasMany(TaskTimeLog::class)->where('status', 'active');
    }

    public function dependencies()
    {
        return $this->hasMany(TaskDependency::class, 'task_id');
    }

    public function blockedBy()
    {
        return $this->belongsToMany(Task::class, 'task_dependencies', 'task_id', 'depends_on_id');
    }

    public function blocking()
    {
        return $this->belongsToMany(Task::class, 'task_dependencies', 'depends_on_id', 'task_id');
    }

    public function activityLogs()
    {
        return $this->morphMany(ActivityLog::class, 'subject');
    }

    public function schedules()
    {
        return $this->hasMany(TaskSchedule::class);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function isBlocked(): bool
    {
        return $this->blockedBy()
            ->where('status', '!=', 'completed')
            ->exists();
    }

    public function canStart(): bool
    {
        return ! $this->isBlocked();
    }
}
