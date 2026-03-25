<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TimeboxPreset extends Model
{
    protected $fillable = [
        'user_id', 'name', 'time_start', 'time_end',
        'days_of_week', 'is_active', 'type', 'color',
    ];

    protected $casts = [
        'days_of_week' => 'array',
        'is_active'    => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Default presets for new users.
     */
    public static function createDefaults(int $userId): void
    {
        self::create([
            'user_id'      => $userId,
            'name'         => 'Lunch Break',
            'time_start'   => '13:00',
            'time_end'     => '13:30',
            'days_of_week' => [1, 2, 3, 4, 5],
            'is_active'    => true,
            'type'         => 'break',
            'color'        => '#f59e0b',
        ]);

        self::create([
            'user_id'      => $userId,
            'name'         => 'Screen Off Time',
            'time_start'   => '15:45',
            'time_end'     => '16:00',
            'days_of_week' => [1, 2, 3, 4, 5],
            'is_active'    => true,
            'type'         => 'break',
            'color'        => '#ef4444',
        ]);
    }
}
