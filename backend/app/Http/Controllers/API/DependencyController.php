<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Services\DependencyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DependencyController extends Controller
{
    public function __construct(
        private readonly DependencyService $dependencyService,
    ) {}

    public function store(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task->project);

        $request->validate([
            'depends_on_id' => 'required|integer|exists:tasks,id',
            'type'          => 'nullable|string|in:finish_to_start,start_to_start,finish_to_finish,start_to_finish',
        ]);

        try {
            $dependency = $this->dependencyService->add(
                $task,
                Task::findOrFail($request->depends_on_id),
                $request->type ?? 'finish_to_start'
            );

            return response()->json($dependency->load('dependsOn:id,title,status'), 201);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function destroy(Task $task, int $dependsOnId): JsonResponse
    {
        $this->authorize('update', $task->project);

        $this->dependencyService->remove($task, $dependsOnId);

        return response()->json(['message' => 'Dependency removed.']);
    }

    public function index(Task $task): JsonResponse
    {
        return response()->json([
            'blocked_by' => $task->blockedBy()->select('tasks.id', 'title', 'status')->get(),
            'blocking'   => $task->blocking()->select('tasks.id', 'title', 'status')->get(),
            'is_blocked' => $task->isBlocked(),
        ]);
    }

    /**
     * GET /api/v1/dependencies/all
     * Returns all tasks that have dependencies (blocked or blocking).
     */
    public function all(): JsonResponse
    {
        $tasksWithDeps = Task::whereHas('blockedBy')
            ->orWhereHas('blocking')
            ->with([
                'project:id,name,color',
                'assignees:id,name,avatar',
                'blockedBy' => fn ($q) => $q->select('tasks.id', 'tasks.title', 'tasks.status', 'tasks.priority')
                    ->with('assignees:id,name,avatar'),
                'blocking' => fn ($q) => $q->select('tasks.id', 'tasks.title', 'tasks.status', 'tasks.priority')
                    ->with('assignees:id,name,avatar'),
            ])
            ->select('id', 'title', 'status', 'priority', 'due_date', 'project_id', 'task_type')
            ->get();

        $formatAssignees = fn ($task) => $task->assignees->map(fn ($a) => [
            'id' => $a->id, 'name' => $a->name, 'avatar_url' => $a->avatar_url,
        ]);

        $formatDep = fn ($d) => [
            'id' => $d->id, 'title' => $d->title, 'status' => $d->status,
            'priority' => $d->priority,
            'assignees' => $formatAssignees($d),
        ];

        $formatTask = fn ($t, $depKey, $depData) => [
            'id'         => $t->id,
            'title'      => $t->title,
            'status'     => $t->status,
            'priority'   => $t->priority,
            'task_type'  => $t->task_type,
            'due_date'   => $t->due_date?->toDateString(),
            'project'    => $t->project ? ['id' => $t->project->id, 'name' => $t->project->name, 'color' => $t->project->color] : null,
            'assignees'  => $formatAssignees($t),
            'is_blocked' => $depKey === 'blocked_by' ? $t->blockedBy->where('status', '!=', 'completed')->isNotEmpty() : false,
            $depKey      => $depData->map($formatDep),
        ];

        $blocked = $tasksWithDeps->filter(fn ($t) => $t->blockedBy->isNotEmpty())
            ->map(fn ($t) => $formatTask($t, 'blocked_by', $t->blockedBy))->values();

        $blocking = $tasksWithDeps->filter(fn ($t) => $t->blocking->isNotEmpty())
            ->map(fn ($t) => $formatTask($t, 'blocking', $t->blocking))->values();

        return response()->json([
            'blocked'  => $blocked,
            'blocking' => $blocking,
        ]);
    }
}
