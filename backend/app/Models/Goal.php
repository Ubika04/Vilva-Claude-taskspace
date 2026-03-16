<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Goal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'title', 'description',
        'target_value', 'current_value', 'unit',
        'start_date', 'due_date', 'status', 'color',
    ];

    protected $casts = [
        'target_value'  => 'float',
        'current_value' => 'float',
        'start_date'    => 'date',
        'due_date'      => 'date',
    ];

    protected $appends = ['progress_percent'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getProgressPercentAttribute(): int
    {
        if (! $this->target_value) return 0;
        return (int) min(100, round(($this->current_value / $this->target_value) * 100));
    }
}
