<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id', 'subject_type', 'subject_id', 'causer_type', 'causer_id',
        'event', 'properties', 'ip_address', 'user_agent', 'created_at',
    ];

    protected $casts = [
        'properties' => 'array',
        'created_at' => 'datetime',
    ];

    public function subject() { return $this->morphTo(); }
    public function causer()  { return $this->morphTo(); }
    public function user()    { return $this->belongsTo(User::class); }
}
