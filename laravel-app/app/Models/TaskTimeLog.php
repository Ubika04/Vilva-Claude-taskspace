<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskTimeLog extends Model
{
    protected $fillable = [
        'task_id', 'user_id', 'start_time', 'end_time', 'paused_at',
        'paused_duration', 'duration', 'status', 'notes', 'is_manual',
    ];

    protected $casts = [
        'start_time'  => 'datetime',
        'end_time'    => 'datetime',
        'paused_at'   => 'datetime',
        'is_manual'   => 'boolean',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getElapsedSecondsAttribute(): int
    {
        if ($this->status === 'stopped') {
            return $this->duration;
        }

        $elapsed = now()->diffInSeconds($this->start_time);
        return $elapsed - $this->paused_duration;
    }
}
