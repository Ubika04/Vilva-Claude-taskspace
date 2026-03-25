<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'clock_in', 'clock_out', 'break_minutes',
        'total_minutes', 'status', 'notes', 'ip_address', 'location',
    ];

    protected $casts = [
        'clock_in'      => 'datetime',
        'clock_out'     => 'datetime',
        'location'      => 'array',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function breaks()
    {
        return $this->hasMany(WorkSessionBreak::class);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isOnBreak(): bool
    {
        return $this->status === 'on_break';
    }

    public function getElapsedMinutesAttribute(): int
    {
        $end = $this->clock_out ?? now();
        return max(0, (int) $this->clock_in->diffInMinutes($end) - $this->break_minutes);
    }

    public function getCurrentBreakAttribute(): ?WorkSessionBreak
    {
        return $this->breaks()->whereNull('end_time')->first();
    }
}
