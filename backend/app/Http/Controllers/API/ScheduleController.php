<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Services\ScheduleConflictService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function __construct(
        private readonly ScheduleConflictService $scheduleService,
    ) {}

    /**
     * POST /tasks/{task}/schedule — Schedule a task for a user with conflict detection
     */
    public function scheduleTask(Task $task, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'scheduled_start' => 'required|date',
            'scheduled_end'   => 'required|date|after:scheduled_start',
            'schedule_type'   => 'sometimes|in:work,review,meeting',
        ]);

        $result = $this->scheduleService->scheduleTask(
            $task,
            $request->user()->id,
            $validated['scheduled_start'],
            $validated['scheduled_end'],
            $validated['schedule_type'] ?? 'work',
        );

        if (!$result['success']) {
            return response()->json($result, 409);
        }

        return response()->json($result, 201);
    }

    /**
     * POST /schedule/validate — Check for conflicts without creating
     */
    public function validate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'task_id'         => 'required|exists:tasks,id',
            'scheduled_start' => 'required|date',
            'scheduled_end'   => 'required|date|after:scheduled_start',
            'schedule_type'   => 'sometimes|in:work,review,meeting',
        ]);

        $task = Task::findOrFail($validated['task_id']);

        // Check time conflicts
        $conflicts = $this->scheduleService->detectConflicts(
            $request->user()->id,
            $validated['scheduled_start'],
            $validated['scheduled_end'],
            $task->id,
            $validated['schedule_type'] ?? 'work',
        );

        // Check dependency conflicts
        $depErrors = $this->scheduleService->validateDependencySchedule(
            $task,
            $validated['scheduled_start'],
            $validated['scheduled_end'],
        );

        return response()->json([
            'has_conflicts'        => $conflicts->isNotEmpty() || !empty($depErrors),
            'time_conflicts'       => $conflicts->map(fn ($s) => [
                'task_id'    => $s->task_id,
                'task_title' => $s->task->title ?? 'Unknown',
                'type'       => $s->schedule_type,
                'start'      => $s->scheduled_start->toISOString(),
                'end'        => $s->scheduled_end->toISOString(),
            ])->values(),
            'dependency_conflicts' => $depErrors,
        ]);
    }

    /**
     * GET /schedule/my — Get current user's schedule for a date range
     */
    public function mySchedule(Request $request): JsonResponse
    {
        $request->validate([
            'from' => 'required|date',
            'to'   => 'required|date|after_or_equal:from',
        ]);

        $schedule = $this->scheduleService->getUserSchedule(
            $request->user()->id,
            $request->input('from'),
            $request->input('to'),
        );

        return response()->json($schedule->map(fn ($s) => [
            'id'              => $s->id,
            'task_id'         => $s->task_id,
            'task'            => $s->task ? [
                'id'        => $s->task->id,
                'title'     => $s->task->title,
                'task_type' => $s->task->task_type,
                'status'    => $s->task->status,
                'priority'  => $s->task->priority,
            ] : null,
            'scheduled_start' => $s->scheduled_start->toISOString(),
            'scheduled_end'   => $s->scheduled_end->toISOString(),
            'schedule_type'   => $s->schedule_type,
            'is_locked'       => $s->is_locked,
            'duration_minutes'=> $s->duration_minutes,
        ]));
    }

    /**
     * GET /schedule/available-slots — Find available time slots
     */
    public function availableSlots(Request $request): JsonResponse
    {
        $request->validate([
            'date'             => 'required|date_format:Y-m-d',
            'duration_minutes' => 'required|integer|min:15|max:480',
            'work_start'       => 'sometimes|date_format:H:i',
            'work_end'         => 'sometimes|date_format:H:i',
        ]);

        $slots = $this->scheduleService->findAvailableSlots(
            $request->user()->id,
            $request->input('date'),
            $request->integer('duration_minutes'),
            $request->input('work_start', '09:00'),
            $request->input('work_end', '18:00'),
        );

        return response()->json(['slots' => $slots]);
    }

    /**
     * DELETE /tasks/{task}/schedule — Remove a task schedule
     */
    public function removeSchedule(Task $task, Request $request): JsonResponse
    {
        $task->schedules()
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json(null, 204);
    }
}
