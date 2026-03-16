<?php

namespace App\Repositories;

use App\Models\Project;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class ProjectRepository extends BaseRepository
{
    public function __construct(Project $model)
    {
        parent::__construct($model);
    }

    public function getForUser(int $userId, array $filters = []): LengthAwarePaginator
    {
        return Project::query()
            ->where(function ($q) use ($userId) {
                $q->where('owner_id', $userId)
                  ->orWhereHas('members', fn($m) => $m->where('users.id', $userId));
            })
            ->when(isset($filters['status']), fn($q) => $q->where('status', $filters['status']))
            ->when(isset($filters['search']), fn($q) => $q->where('name', 'like', "%{$filters['search']}%"))
            ->with(['owner:id,name,avatar', 'members:id,name,avatar'])
            ->withCount('tasks')
            ->latest()
            ->paginate($filters['per_page'] ?? 15);
    }

    public function findWithDetails(int $id): Project
    {
        return Project::with([
            'owner:id,name,avatar',
            'members:id,name,avatar',
            'tags',
        ])->withCount(['tasks', 'tasks as completed_tasks_count' => fn($q) => $q->where('status', 'completed')])
          ->findOrFail($id);
    }

    public function getProgressStats(int $projectId): array
    {
        return Cache::remember("project:{$projectId}:stats", 300, function () use ($projectId) {
            $project = Project::withCount([
                'tasks',
                'tasks as completed_count'   => fn($q) => $q->where('status', 'completed'),
                'tasks as in_progress_count' => fn($q) => $q->where('status', 'in_progress'),
                'tasks as overdue_count'      => fn($q) => $q->where('due_date', '<', now())->where('status', '!=', 'completed'),
            ])->findOrFail($projectId);

            return [
                'total'       => $project->tasks_count,
                'completed'   => $project->completed_count,
                'in_progress' => $project->in_progress_count,
                'overdue'     => $project->overdue_count,
                'progress'    => $project->progress,
            ];
        });
    }

    public function invalidateCache(int $projectId): void
    {
        Cache::forget("project:{$projectId}:stats");
    }
}
