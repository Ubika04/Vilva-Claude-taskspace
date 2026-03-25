<?php

namespace App\Services;

use App\Models\Task;
use App\Models\TaskSchedule;
use Illuminate\Support\Collection;

class ScheduleConflictService
{
    /**
     * Non-overlapping task types — these must never overlap for the same user.
     */
    private const EXCLUSIVE_TYPES = ['review', 'meeting'];

    /**
     * Check if scheduling a task would conflict with existing schedules.
     * Returns conflicting schedules or empty collection.
     */
    public function detectConflicts(
        int $userId,
        string $scheduledStart,
        string $scheduledEnd,
        ?int $excludeTaskId = null,
        ?string $scheduleType = 'work',
    ): Collection {
        $query = TaskSchedule::where('user_id', $userId)
            ->where(function ($q) use ($scheduledStart, $scheduledEnd) {
                // Overlap detection: new start < existing end AND new end > existing start
                $q->where('scheduled_start', '<', $scheduledEnd)
                  ->where('scheduled_end', '>', $scheduledStart);
            });

        if ($excludeTaskId) {
            $query->where('task_id', '!=', $excludeTaskId);
        }

        $conflicts = $query->with('task:id,title,task_type,status,priority')->get();

        // For review/meeting types, ALL overlaps are conflicts
        if (in_array($scheduleType, self::EXCLUSIVE_TYPES)) {
            return $conflicts;
        }

        // For regular work tasks, only conflict with review/meeting types
        return $conflicts->filter(function ($schedule) {
            return in_array($schedule->schedule_type, self::EXCLUSIVE_TYPES);
        });
    }

    /**
     * Check if a task with dependencies can be scheduled without
     * overlapping its dependency chain.
     */
    public function validateDependencySchedule(Task $task, string $scheduledStart, string $scheduledEnd): array
    {
        $errors = [];

        // Must start AFTER all blocking tasks end
        $blockers = $task->blockedBy()
            ->where('status', '!=', 'completed')
            ->get();

        foreach ($blockers as $blocker) {
            $blockerSchedule = TaskSchedule::where('task_id', $blocker->id)->first();
            if ($blockerSchedule && $blockerSchedule->scheduled_end > $scheduledStart) {
                $errors[] = [
                    'type'    => 'dependency_overlap',
                    'message' => "Cannot start before dependency \"{$blocker->title}\" ends at {$blockerSchedule->scheduled_end->format('M d, H:i')}",
                    'blocker' => [
                        'id'    => $blocker->id,
                        'title' => $blocker->title,
                        'ends'  => $blockerSchedule->scheduled_end->toISOString(),
                    ],
                ];
            }
        }

        // Must end BEFORE all tasks this blocks start
        $dependents = $task->blocking()
            ->where('status', '!=', 'completed')
            ->get();

        foreach ($dependents as $dependent) {
            $depSchedule = TaskSchedule::where('task_id', $dependent->id)->first();
            if ($depSchedule && $scheduledEnd > $depSchedule->scheduled_start) {
                $errors[] = [
                    'type'    => 'dependent_overlap',
                    'message' => "Must end before dependent task \"{$dependent->title}\" starts at {$depSchedule->scheduled_start->format('M d, H:i')}",
                    'dependent' => [
                        'id'     => $dependent->id,
                        'title'  => $dependent->title,
                        'starts' => $depSchedule->scheduled_start->toISOString(),
                    ],
                ];
            }
        }

        return $errors;
    }

    /**
     * Create or update a task schedule, with full conflict + dependency validation.
     */
    public function scheduleTask(
        Task $task,
        int $userId,
        string $scheduledStart,
        string $scheduledEnd,
        string $scheduleType = 'work',
    ): array {
        // Determine schedule type from task type
        if (in_array($task->task_type, ['review', 'meeting'])) {
            $scheduleType = $task->task_type;
        }

        // 1. Check time conflicts for same user
        $conflicts = $this->detectConflicts($userId, $scheduledStart, $scheduledEnd, $task->id, $scheduleType);
        if ($conflicts->isNotEmpty()) {
            return [
                'success'   => false,
                'error'     => 'schedule_conflict',
                'message'   => 'This time slot conflicts with existing scheduled tasks.',
                'conflicts' => $conflicts->map(fn ($s) => [
                    'task_id'    => $s->task_id,
                    'task_title' => $s->task->title ?? 'Unknown',
                    'type'       => $s->schedule_type,
                    'start'      => $s->scheduled_start->toISOString(),
                    'end'        => $s->scheduled_end->toISOString(),
                ])->values(),
            ];
        }

        // 2. Check dependency chain
        $depErrors = $this->validateDependencySchedule($task, $scheduledStart, $scheduledEnd);
        if (!empty($depErrors)) {
            return [
                'success' => false,
                'error'   => 'dependency_conflict',
                'message' => 'Schedule conflicts with task dependencies.',
                'errors'  => $depErrors,
            ];
        }

        // 3. Create/update schedule
        $schedule = TaskSchedule::updateOrCreate(
            ['task_id' => $task->id, 'user_id' => $userId],
            [
                'scheduled_start' => $scheduledStart,
                'scheduled_end'   => $scheduledEnd,
                'schedule_type'   => $scheduleType,
            ]
        );

        return [
            'success'  => true,
            'schedule' => $schedule,
        ];
    }

    /**
     * Get user's schedule for a date range.
     */
    public function getUserSchedule(int $userId, string $from, string $to): Collection
    {
        return TaskSchedule::where('user_id', $userId)
            ->where('scheduled_start', '<', $to)
            ->where('scheduled_end', '>', $from)
            ->with('task:id,title,task_type,status,priority,project_id')
            ->orderBy('scheduled_start')
            ->get();
    }

    /**
     * Find available time slots for a user within a date range.
     */
    public function findAvailableSlots(
        int $userId,
        string $date,
        int $durationMinutes,
        string $workStart = '09:00',
        string $workEnd = '18:00',
    ): array {
        $dayStart = "{$date} {$workStart}:00";
        $dayEnd   = "{$date} {$workEnd}:00";

        $existing = TaskSchedule::where('user_id', $userId)
            ->where('scheduled_start', '<', $dayEnd)
            ->where('scheduled_end', '>', $dayStart)
            ->orderBy('scheduled_start')
            ->get();

        $slots = [];
        $cursor = strtotime($dayStart);
        $end    = strtotime($dayEnd);
        $needed = $durationMinutes * 60;

        foreach ($existing as $schedule) {
            $schedStart = strtotime($schedule->scheduled_start);
            $schedEnd   = strtotime($schedule->scheduled_end);

            if ($schedStart - $cursor >= $needed) {
                $slots[] = [
                    'start' => date('Y-m-d H:i:s', $cursor),
                    'end'   => date('Y-m-d H:i:s', $cursor + $needed),
                ];
            }
            $cursor = max($cursor, $schedEnd);
        }

        if ($end - $cursor >= $needed) {
            $slots[] = [
                'start' => date('Y-m-d H:i:s', $cursor),
                'end'   => date('Y-m-d H:i:s', $cursor + $needed),
            ];
        }

        return $slots;
    }
}
