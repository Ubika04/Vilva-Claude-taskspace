<?php

namespace App\Services;

use App\Models\Task;
use App\Models\TaskTimeLog;
use App\Repositories\TimerRepository;
use Illuminate\Support\Facades\DB;

class TimerService
{
    public function __construct(
        private readonly TimerRepository $timerRepo,
    ) {}

    /**
     * Start a new timer for the given user + task.
     * Throws if the user already has an active timer (on any task).
     */
    public function start(Task $task, int $userId): TaskTimeLog
    {
        $existing = $this->timerRepo->getActiveTimerForUser($userId);

        if ($existing) {
            throw new \DomainException(
                "You already have an active timer on task #{$existing->task_id}. Stop it first."
            );
        }

        return $this->timerRepo->create([
            'task_id'    => $task->id,
            'user_id'    => $userId,
            'start_time' => now(),
            'status'     => 'active',
        ]);
    }

    /**
     * Pause an active timer.
     */
    public function pause(Task $task, int $userId): TaskTimeLog
    {
        $log = $this->timerRepo->getActiveTimerForUserAndTask($userId, $task->id);

        if (! $log || $log->status !== 'active') {
            throw new \DomainException('No active timer found for this task.');
        }

        $log->update([
            'status'    => 'paused',
            'paused_at' => now(),
        ]);

        return $log->fresh();
    }

    /**
     * Resume a paused timer.
     */
    public function resume(Task $task, int $userId): TaskTimeLog
    {
        $log = $this->timerRepo->getActiveTimerForUserAndTask($userId, $task->id);

        if (! $log || $log->status !== 'paused') {
            throw new \DomainException('No paused timer found for this task.');
        }

        // Accumulate pause duration
        $pausedSeconds = $log->paused_at ? now()->diffInSeconds($log->paused_at) : 0;

        $log->update([
            'status'          => 'active',
            'paused_at'       => null,
            'paused_duration' => $log->paused_duration + $pausedSeconds,
        ]);

        return $log->fresh();
    }

    /**
     * Stop a timer and calculate total duration.
     */
    public function stop(Task $task, int $userId, ?string $notes = null): TaskTimeLog
    {
        return DB::transaction(function () use ($task, $userId, $notes) {
            $log = $this->timerRepo->getActiveTimerForUserAndTask($userId, $task->id);

            if (! $log) {
                throw new \DomainException('No active or paused timer found for this task.');
            }

            $endTime  = now();
            $total    = $endTime->diffInSeconds($log->start_time) - $log->paused_duration;

            $log->update([
                'status'   => 'stopped',
                'end_time' => $endTime,
                'duration' => max(0, $total),
                'notes'    => $notes,
            ]);

            // Update task total time spent (in minutes)
            $task->increment('total_time_spent', (int) ceil($total / 60));

            return $log->fresh();
        });
    }

    /**
     * Add a manual time entry.
     */
    public function addManual(Task $task, int $userId, array $data): TaskTimeLog
    {
        $start    = \Carbon\Carbon::parse($data['start_time']);
        $end      = \Carbon\Carbon::parse($data['end_time']);
        $duration = $end->diffInSeconds($start);

        $log = $this->timerRepo->create([
            'task_id'    => $task->id,
            'user_id'    => $userId,
            'start_time' => $start,
            'end_time'   => $end,
            'duration'   => $duration,
            'notes'      => $data['notes'] ?? null,
            'status'     => 'stopped',
            'is_manual'  => true,
        ]);

        $task->increment('total_time_spent', (int) ceil($duration / 60));

        return $log;
    }
}
