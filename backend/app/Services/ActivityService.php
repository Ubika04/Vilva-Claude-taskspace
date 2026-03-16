<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;

class ActivityService
{
    public function log(string $event, Model $subject, ?Model $causer = null, array $properties = []): ActivityLog
    {
        return ActivityLog::create([
            'user_id'      => $causer?->id,
            'subject_type' => get_class($subject),
            'subject_id'   => $subject->getKey(),
            'causer_type'  => $causer ? get_class($causer) : null,
            'causer_id'    => $causer?->getKey(),
            'event'        => $event,
            'properties'   => $properties,
            'ip_address'   => request()->ip(),
            'user_agent'   => request()->userAgent(),
            'created_at'   => now(),
        ]);
    }
}
