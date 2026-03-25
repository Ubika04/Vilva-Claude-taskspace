<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkSessionBreak extends Model
{
    protected $fillable = [
        'work_session_id', 'start_time', 'end_time', 'reason',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time'   => 'datetime',
    ];

    public function session()
    {
        return $this->belongsTo(WorkSession::class, 'work_session_id');
    }

    public function getDurationMinutesAttribute(): int
    {
        $end = $this->end_time ?? now();
        return max(0, (int) $this->start_time->diffInMinutes($end));
    }
}
