<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Requests\Task\MoveTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Project;
use App\Models\Task;
use App\Repositories\TaskRepository;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function __construct(
        private readonly TaskService    $taskService,
        private readonly TaskRepository $taskRepo,
    ) {}

    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $tasks = $this->taskRepo->getForProject($project->id, $request->only([
            'status', 'priority', 'assignee', 'search', 'tag', 'per_page',
        ]));

        return response()->json(TaskResource::collection($tasks));
    }

    public function kanban(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $board = $this->taskRepo->getKanbanBoard($project->id);

        return response()->json($board);
    }

    public function store(StoreTaskRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $task = $this->taskService->create(
            array_merge($request->validated(), ['project_id' => $project->id]),
            auth()->id()
        );

        return response()->json(new TaskResource($task), 201);
    }

    public function show(Task $task): JsonResponse
    {
        $this->authorize('view', $task->project);

        return response()->json(new TaskResource($this->taskRepo->findWithDetails($task->id)));
    }

    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task->project);

        $task = $this->taskService->update($task, $request->validated());

        return response()->json(new TaskResource($task));
    }

    public function destroy(Task $task): JsonResponse
    {
        $this->authorize('update', $task->project);

        $this->taskService->delete($task);

        return response()->json(['message' => 'Task deleted.']);
    }

    /**
     * Move task to a new column (Kanban drag-drop).
     */
    public function move(MoveTaskRequest $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task->project);

        $task = $this->taskService->moveToColumn(
            $task,
            $request->status,
            $request->position
        );

        return response()->json(new TaskResource($task));
    }

    /**
     * Reorder tasks within a column.
     */
    public function reorder(Request $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $request->validate([
            'status'      => 'required|string',
            'ordered_ids' => 'required|array',
            'ordered_ids.*' => 'integer|exists:tasks,id',
        ]);

        $this->taskRepo->reorderInColumn($project->id, $request->status, $request->ordered_ids);

        return response()->json(['message' => 'Tasks reordered.']);
    }

    public function myTasks(Request $request): JsonResponse
    {
        $tasks = $this->taskRepo->getAssignedToUser(auth()->id(), $request->only(['status', 'per_page']));

        return response()->json(TaskResource::collection($tasks));
    }

    public function overdue(): JsonResponse
    {
        $tasks = $this->taskRepo->getOverdueTasks(auth()->id());

        return response()->json(TaskResource::collection($tasks));
    }
}
