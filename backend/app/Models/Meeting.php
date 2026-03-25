<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Meeting extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title', 'description', 'organizer_id', 'project_id',
        'scheduled_start', 'scheduled_end', 'location', 'video_link',
        'notes', 'status', 'color',
    ];

    protected $casts = [
        'scheduled_start' => 'datetime',
        'scheduled_end'   => 'datetime',
    ];

    public function organizer()
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function attendees()
    {
        return $this->belongsToMany(User::class, 'meeting_attendees')
            ->withPivot('rsvp_status', 'responded_at')
            ->withTimestamps();
    }

    public function getDurationMinutesAttribute(): int
    {
        return $this->scheduled_start && $this->scheduled_end
            ? $this->scheduled_start->diffInMinutes($this->scheduled_end)
            : 0;
    }
}
