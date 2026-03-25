<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskSchedule extends Model
{
    protected $fillable = [
        'task_id', 'user_id', 'scheduled_start', 'scheduled_end',
        'schedule_type', 'is_locked',
    ];

    protected $casts = [
        'scheduled_start' => 'datetime',
        'scheduled_end'   => 'datetime',
        'is_locked'       => 'boolean',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getDurationMinutesAttribute(): int
    {
        return max(0, (int) $this->scheduled_start->diffInMinutes($this->scheduled_end));
    }
}
