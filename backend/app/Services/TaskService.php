<?php

namespace App\Services;

use App\Events\TaskAssigned;
use App\Events\TaskStatusChanged;
use App\Models\Task;
use App\Repositories\ProjectRepository;
use App\Repositories\TaskRepository;
use Illuminate\Support\Facades\DB;

class TaskService
{
    public function __construct(
        private readonly TaskRepository    $taskRepo,
        private readonly ProjectRepository $projectRepo,
        private readonly ActivityService   $activityService,
    ) {}

    public function create(array $data, int $createdBy): Task
    {
        return DB::transaction(function () use ($data, $createdBy) {
            // Set position at end of column
            $maxPosition = Task::where('project_id', $data['project_id'])
                ->where('status', $data['status'] ?? 'backlog')
                ->max('position') ?? -1;

            $task = $this->taskRepo->create([
                ...$data,
                'created_by' => $createdBy,
                'position'   => $maxPosition + 1,
            ]);

            // Sync assignees
            if (! empty($data['assignees'])) {
                $task->assignees()->sync($data['assignees']);
                foreach ($data['assignees'] as $assigneeId) {
                    event(new TaskAssigned($task, $assigneeId));
                }
            }

            // Sync tags
            if (! empty($data['tags'])) {
                $task->tags()->sync($data['tags']);
            }

            $this->activityService->log('created', $task, auth()->user());
            $this->projectRepo->invalidateCache($task->project_id);

            return $task->load('assignees', 'tags');
        });
    }

    public function update(Task $task, array $data): Task
    {
        return DB::transaction(function () use ($task, $data) {
            $oldStatus = $task->status;

            $this->taskRepo->update($task, $data);
            $task->refresh();

            // Status changed
            if (isset($data['status']) && $oldStatus !== $data['status']) {
                if ($data['status'] === 'completed') {
                    $task->update(['completed_at' => now()]);
                }
                event(new TaskStatusChanged($task, $oldStatus, $data['status']));
            }

            // Sync assignees
            if (isset($data['assignees'])) {
                $old = $task->assignees->pluck('id')->toArray();
                $task->assignees()->sync($data['assignees']);
                $new = array_diff($data['assignees'], $old);
                foreach ($new as $assigneeId) {
                    event(new TaskAssigned($task, $assigneeId));
                }
            }

            if (isset($data['tags'])) {
                $task->tags()->sync($data['tags']);
            }

            $this->activityService->log('updated', $task, auth()->user());
            $this->projectRepo->invalidateCache($task->project_id);

            return $task->load('assignees', 'tags');
        });
    }

    public function moveToColumn(Task $task, string $status, ?int $position = null): Task
    {
        $old = $task->status;

        $task->update([
            'status'   => $status,
            'position' => $position ?? Task::where('project_id', $task->project_id)
                              ->where('status', $status)->max('position') + 1,
            'completed_at' => $status === 'completed' ? now() : null,
        ]);

        if ($old !== $status) {
            event(new TaskStatusChanged($task, $old, $status));
            $this->activityService->log('status_changed', $task, auth()->user(), [
                'from' => $old, 'to' => $status,
            ]);
        }

        $this->projectRepo->invalidateCache($task->project_id);

        return $task;
    }

    public function delete(Task $task): void
    {
        DB::transaction(function () use ($task) {
            $projectId = $task->project_id;
            $this->activityService->log('deleted', $task, auth()->user());
            $this->taskRepo->delete($task);
            $this->projectRepo->invalidateCache($projectId);
        });
    }
}
