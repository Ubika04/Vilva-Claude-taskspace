<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Requests\Task\MoveTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Repositories\TaskRepository;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TaskController extends Controller
{
    public function __construct(
        private readonly TaskService    $taskService,
        private readonly TaskRepository $taskRepo,
    ) {}

    public function index(Request $request, Project $project): AnonymousResourceCollection
    {
        $this->authorize('view', $project);

        $tasks = $this->taskRepo->getForProject($project->id, $request->only([
            'status', 'priority', 'assignee', 'search', 'tag', 'task_type',
            'sort_by', 'sort_dir', 'per_page',
        ]));

        return TaskResource::collection($tasks);
    }

    public function kanban(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $board = $this->taskRepo->getKanbanBoard($project->id);

        // Add is_blocked computed field for kanban cards
        $board = $board->map(function ($tasks) {
            return $tasks->map(function ($task) {
                $arr = $task->toArray();
                $arr['is_blocked'] = $task->blockedBy
                    ->where('status', '!=', 'completed')
                    ->isNotEmpty();
                return $arr;
            });
        });

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

    public function myTasks(Request $request): AnonymousResourceCollection
    {
        $tasks = $this->taskRepo->getAssignedToUser(auth()->id(), $request->only(['status', 'per_page']));

        return TaskResource::collection($tasks);
    }

    public function activity(Task $task): JsonResponse
    {
        $this->authorize('view', $task->project);

        $logs = ActivityLog::with('user')
            ->where('subject_type', Task::class)
            ->where('subject_id', $task->id)
            ->latest('created_at')
            ->limit(50)
            ->get()
            ->map(fn ($log) => [
                'id'         => $log->id,
                'event'      => $log->event,
                'properties' => $log->properties,
                'user'       => $log->user ? [
                    'id'         => $log->user->id,
                    'name'       => $log->user->name,
                    'avatar_url' => $log->user->avatar_url,
                ] : null,
                'created_at' => $log->created_at?->toIso8601String(),
            ]);

        return response()->json(['data' => $logs]);
    }

    public function overdue(): AnonymousResourceCollection
    {
        $tasks = $this->taskRepo->getOverdueTasks(auth()->id());

        return TaskResource::collection($tasks);
    }

    /**
     * POST /tasks/{task}/reviewers
     */
    public function addReviewers(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task->project);

        $request->validate([
            'reviewer_ids'   => 'required|array|min:1',
            'reviewer_ids.*' => 'integer|exists:users,id',
        ]);

        foreach ($request->reviewer_ids as $userId) {
            $task->reviewers()->syncWithoutDetaching([
                $userId => ['review_status' => 'pending'],
            ]);
        }

        return response()->json([
            'message'   => 'Reviewers added.',
            'reviewers' => $task->fresh()->reviewers->map(fn ($r) => [
                'id'            => $r->id,
                'name'          => $r->name,
                'avatar_url'    => $r->avatar_url,
                'review_status' => $r->pivot->review_status,
                'review_note'   => $r->pivot->review_note,
                'reviewed_at'   => $r->pivot->reviewed_at,
            ]),
        ]);
    }

    /**
     * DELETE /tasks/{task}/reviewers/{user}
     */
    public function removeReviewer(Task $task, User $user): JsonResponse
    {
        $this->authorize('update', $task->project);

        $task->reviewers()->detach($user->id);

        return response()->json(['message' => 'Reviewer removed.']);
    }

    /**
     * POST /tasks/{task}/review
     * Submit a review decision (approve/reject).
     */
    public function submitReview(Request $request, Task $task): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'note'   => 'nullable|string|max:1000',
        ]);

        $userId = auth()->id();

        // Must be an assigned reviewer
        if (! $task->reviewers()->where('users.id', $userId)->exists()) {
            return response()->json(['message' => 'You are not a reviewer of this task.'], 403);
        }

        $task->reviewers()->updateExistingPivot($userId, [
            'review_status' => $request->status,
            'review_note'   => $request->note,
            'reviewed_at'   => now(),
        ]);

        // Auto-mark task as reviewed if all reviewers approved
        $allApproved = $task->fresh()->reviewers->every(fn ($r) => $r->pivot->review_status === 'approved');
        if ($allApproved) {
            $task->update(['is_reviewed' => true]);
        }

        return response()->json([
            'message'      => 'Review submitted.',
            'all_approved' => $allApproved,
            'reviewers'    => $task->fresh()->reviewers->map(fn ($r) => [
                'id'            => $r->id,
                'name'          => $r->name,
                'avatar_url'    => $r->avatar_url,
                'review_status' => $r->pivot->review_status,
                'review_note'   => $r->pivot->review_note,
                'reviewed_at'   => $r->pivot->reviewed_at,
            ]),
        ]);
    }
}
