<?php

namespace App\Repositories;

use App\Models\TaskTimeLog;

class TimerRepository extends BaseRepository
{
    public function __construct(TaskTimeLog $model)
    {
        parent::__construct($model);
    }

    public function getActiveTimerForUser(int $userId): ?TaskTimeLog
    {
        return TaskTimeLog::where('user_id', $userId)
            ->whereIn('status', ['active', 'paused'])
            ->first();
    }

    public function getActiveTimerForUserAndTask(int $userId, int $taskId): ?TaskTimeLog
    {
        return TaskTimeLog::where('user_id', $userId)
            ->where('task_id', $taskId)
            ->whereIn('status', ['active', 'paused'])
            ->first();
    }

    public function getLogsForTask(int $taskId, int $perPage = 20)
    {
        return TaskTimeLog::where('task_id', $taskId)
            ->with('user:id,name,avatar')
            ->latest('start_time')
            ->paginate($perPage);
    }

    public function getTotalTimeForTask(int $taskId): int
    {
        return TaskTimeLog::where('task_id', $taskId)
            ->where('status', 'stopped')
            ->sum('duration');
    }

    public function getUserProductivity(int $userId, string $from, string $to): array
    {
        return TaskTimeLog::where('user_id', $userId)
            ->where('status', 'stopped')
            ->whereBetween('start_time', [$from, $to])
            ->with('task:id,title,project_id')
            ->get()
            ->groupBy(fn($log) => $log->start_time->toDateString())
            ->map(fn($logs) => $logs->sum('duration'))
            ->toArray();
    }
}
