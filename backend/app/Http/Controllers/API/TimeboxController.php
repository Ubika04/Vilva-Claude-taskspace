<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TimeboxPreset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimeboxController extends Controller
{
    /**
     * Get user's timebox presets (default blocks like lunch, screen-off).
     */
    public function presets(Request $request): JsonResponse
    {
        $presets = TimeboxPreset::where('user_id', $request->user()->id)
            ->orderBy('time_start')
            ->get();

        // Auto-create defaults if none exist
        if ($presets->isEmpty()) {
            TimeboxPreset::createDefaults($request->user()->id);
            $presets = TimeboxPreset::where('user_id', $request->user()->id)->orderBy('time_start')->get();
        }

        return response()->json(['data' => $presets]);
    }

    /**
     * Create a timebox preset.
     */
    public function storePreset(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'         => 'required|string|max:100',
            'time_start'   => 'required|date_format:H:i',
            'time_end'     => 'required|date_format:H:i|after:time_start',
            'days_of_week' => 'nullable|array',
            'days_of_week.*' => 'integer|between:0,6',
            'type'         => 'nullable|string|in:break,focus,meeting',
            'color'        => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $data['user_id'] = $request->user()->id;

        $preset = TimeboxPreset::create($data);

        return response()->json(['data' => $preset], 201);
    }

    /**
     * Update a timebox preset.
     */
    public function updatePreset(Request $request, TimeboxPreset $preset): JsonResponse
    {
        abort_if($preset->user_id !== $request->user()->id, 403);

        $data = $request->validate([
            'name'         => 'sometimes|string|max:100',
            'time_start'   => 'sometimes|date_format:H:i',
            'time_end'     => 'sometimes|date_format:H:i',
            'days_of_week' => 'nullable|array',
            'days_of_week.*' => 'integer|between:0,6',
            'is_active'    => 'sometimes|boolean',
            'type'         => 'nullable|string|in:break,focus,meeting',
            'color'        => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $preset->update($data);

        return response()->json(['data' => $preset]);
    }

    /**
     * Delete a timebox preset.
     */
    public function destroyPreset(Request $request, TimeboxPreset $preset): JsonResponse
    {
        abort_if($preset->user_id !== $request->user()->id, 403);

        $preset->delete();

        return response()->json(['message' => 'Preset deleted.']);
    }

    /**
     * Validate timebox: check for overlaps with other tasks and preset blocks.
     * Returns conflicts if any.
     */
    public function validateTimebox(Request $request): JsonResponse
    {
        $data = $request->validate([
            'timebox_start' => 'required|date',
            'timebox_end'   => 'required|date|after:timebox_start',
            'task_id'       => 'nullable|integer|exists:tasks,id',
        ]);

        $start  = $data['timebox_start'];
        $end    = $data['timebox_end'];
        $taskId = $data['task_id'] ?? null;
        $userId = $request->user()->id;

        $conflicts = [];

        // 1. Check overlap with other timeboxed tasks assigned to the user
        $overlapping = Task::query()
            ->whereNotNull('timebox_start')
            ->whereNotNull('timebox_end')
            ->where('timebox_start', '<', $end)
            ->where('timebox_end', '>', $start)
            ->whereNotIn('status', ['completed'])
            ->whereHas('assignees', fn($q) => $q->where('users.id', $userId))
            ->when($taskId, fn($q) => $q->where('id', '!=', $taskId))
            ->get(['id', 'title', 'timebox_start', 'timebox_end']);

        foreach ($overlapping as $t) {
            $conflicts[] = [
                'type'    => 'task',
                'id'      => $t->id,
                'title'   => $t->title,
                'start'   => $t->timebox_start,
                'end'     => $t->timebox_end,
                'message' => "Overlaps with task: {$t->title}",
            ];
        }

        // 2. Check overlap with timebox presets (e.g., lunch, screen-off)
        $dayOfWeek = date('w', strtotime($start)); // 0=Sun, 6=Sat
        $timeStart = date('H:i', strtotime($start));
        $timeEnd   = date('H:i', strtotime($end));

        $presets = TimeboxPreset::where('user_id', $userId)
            ->where('is_active', true)
            ->get();

        foreach ($presets as $preset) {
            $days = $preset->days_of_week ?? [0, 1, 2, 3, 4, 5, 6];
            if (! in_array((int) $dayOfWeek, $days)) continue;

            // Check time overlap
            if ($timeStart < $preset->time_end && $timeEnd > $preset->time_start) {
                $conflicts[] = [
                    'type'    => 'preset',
                    'id'      => $preset->id,
                    'title'   => $preset->name,
                    'start'   => $preset->time_start,
                    'end'     => $preset->time_end,
                    'message' => "Conflicts with {$preset->name} ({$preset->time_start}–{$preset->time_end})",
                ];
            }
        }

        return response()->json([
            'has_conflicts' => count($conflicts) > 0,
            'conflicts'     => $conflicts,
        ]);
    }

    /**
     * Get user's timeboxed tasks for a date range (for calendar view).
     */
    public function schedule(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'required|date',
        ]);

        $date   = $request->date;
        $userId = $request->user()->id;

        // Get timeboxed tasks for this date
        $tasks = Task::query()
            ->whereDate('timebox_start', $date)
            ->whereHas('assignees', fn($q) => $q->where('users.id', $userId))
            ->with(['project:id,name,color', 'assignees:id,name,avatar'])
            ->orderBy('timebox_start')
            ->get(['id', 'title', 'status', 'priority', 'timebox_start', 'timebox_end', 'project_id', 'task_type']);

        // Get active presets for this day of week
        $dayOfWeek = date('w', strtotime($date));
        $presets = TimeboxPreset::where('user_id', $userId)
            ->where('is_active', true)
            ->get()
            ->filter(fn($p) => in_array((int) $dayOfWeek, $p->days_of_week ?? [0,1,2,3,4,5,6]));

        return response()->json([
            'tasks'   => $tasks,
            'presets' => $presets->values(),
        ]);
    }
}
