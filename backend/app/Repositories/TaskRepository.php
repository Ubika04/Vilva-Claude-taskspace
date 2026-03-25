<?php

namespace App\Repositories;

use App\Models\Task;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class TaskRepository extends BaseRepository
{
    public function __construct(Task $model)
    {
        parent::__construct($model);
    }

    public function getForProject(int $projectId, array $filters = []): LengthAwarePaginator
    {
        $query = Task::query()
            ->where('project_id', $projectId)
            ->whereNull('parent_id')
            ->when(isset($filters['status']),    fn($q) => $q->where('status', $filters['status']))
            ->when(isset($filters['priority']),  fn($q) => $q->where('priority', $filters['priority']))
            ->when(isset($filters['assignee']),  fn($q) => $q->whereHas('assignees', fn($a) => $a->where('users.id', $filters['assignee'])))
            ->when(isset($filters['search']),    fn($q) => $q->where('title', 'like', "%{$filters['search']}%"))
            ->when(isset($filters['tag']),       fn($q) => $q->whereHas('tags', fn($t) => $t->where('tags.id', $filters['tag'])))
            ->when(isset($filters['task_type']), fn($q) => $q->where('task_type', $filters['task_type']))
            ->with(['assignees:id,name,avatar', 'tags', 'subtasks'])
            ->withCount('subtasks');

        // Sorting support for list view
        $sortBy  = $filters['sort_by'] ?? 'position';
        $sortDir = $filters['sort_dir'] ?? 'asc';

        $allowedSorts = [
            'title', 'status', 'priority', 'due_date', 'score',
            'created_at', 'total_time_spent', 'position', 'task_type',
        ];

        if (in_array($sortBy, $allowedSorts)) {
            // Custom ordering for priority and status
            if ($sortBy === 'priority') {
                $query->orderByRaw("FIELD(priority, 'urgent','high','medium','low') " . ($sortDir === 'desc' ? 'DESC' : 'ASC'));
            } elseif ($sortBy === 'status') {
                $query->orderByRaw("FIELD(status, 'backlog','todo','in_progress','working_on','review','completed') " . ($sortDir === 'desc' ? 'DESC' : 'ASC'));
            } else {
                $query->orderBy($sortBy, $sortDir);
            }
        } else {
            $query->orderBy('position');
        }

        return $query->paginate($filters['per_page'] ?? 25);
    }

    public function getKanbanBoard(int $projectId): Collection
    {
        return Task::query()
            ->where('project_id', $projectId)
            ->whereNull('parent_id')
            ->with(['assignees:id,name,avatar', 'tags', 'blockedBy:id,title,status', 'timeLogs' => fn($q) => $q->where('status', 'active')])
            ->withCount('subtasks')
            ->orderBy('status')
            ->orderBy('position')
            ->get()
            ->groupBy('status');
    }

    public function getAssignedToUser(int $userId, array $filters = []): LengthAwarePaginator
    {
        return Task::query()
            ->whereHas('assignees', fn($q) => $q->where('users.id', $userId))
            ->when(isset($filters['status']), fn($q) => $q->where('status', $filters['status']))
            ->with(['project:id,name,color', 'tags'])
            ->latest('due_date')
            ->paginate($filters['per_page'] ?? 15);
    }

    public function getOverdueTasks(int $userId): Collection
    {
        return Task::query()
            ->whereHas('assignees', fn($q) => $q->where('users.id', $userId))
            ->where('due_date', '<', now()->toDateString())
            ->whereNotIn('status', ['completed'])
            ->with(['project:id,name,color'])
            ->orderBy('due_date')
            ->get();
    }

    public function findWithDetails(int $taskId): Task
    {
        return Task::with([
            'project:id,name,color',
            'creator:id,name,avatar',
            'assignees:id,name,avatar',
            'watchers:id,name,avatar',
            'reviewers:id,name,avatar',
            'tags',
            'subtasks.assignees:id,name,avatar',
            'comments.user:id,name,avatar',
            'attachments.user:id,name,avatar',
            'blockedBy:id,title,status',
            'blocking:id,title,status',
            'timeLogs' => fn($q) => $q->where('status', 'active'),
        ])->withCount('subtasks')->findOrFail($taskId);
    }

    public function reorderInColumn(int $projectId, string $status, array $orderedIds): void
    {
        foreach ($orderedIds as $position => $taskId) {
            Task::where('id', $taskId)
                ->where('project_id', $projectId)
                ->update(['position' => $position, 'status' => $status]);
        }
    }
}
