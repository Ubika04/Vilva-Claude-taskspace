<?php

namespace App\Services;

use App\Events\TaskAssigned;
use App\Events\TaskStatusChanged;
use App\Models\Task;
use App\Models\TaskTimeLog;
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
            // Default status to in_progress (standard header: auto-run task on create)
            $data['status'] = $data['status'] ?? 'in_progress';

            // Set position at end of column
            $maxPosition = Task::where('project_id', $data['project_id'])
                ->where('status', $data['status'])
                ->max('position') ?? -1;

            $task = $this->taskRepo->create([
                ...$data,
                'created_by' => $createdBy,
                'position'   => $maxPosition + 1,
            ]);

            // Normalize _ids aliases from frontend
            $assignees = $data['assignees'] ?? $data['assignee_ids'] ?? [];
            $tags      = $data['tags']      ?? $data['tag_ids']      ?? [];
            $watchers  = $data['watcher_ids'] ?? [];

            // Sync assignees
            if (! empty($assignees)) {
                $task->assignees()->sync($assignees);
                foreach ($assignees as $assigneeId) {
                    event(new TaskAssigned($task, $assigneeId));
                }
            }

            // Sync watchers
            if (! empty($watchers)) {
                $task->watchers()->sync($watchers);
            }

            // Sync reviewers
            $reviewers = $data['reviewer_ids'] ?? [];
            if (! empty($reviewers)) {
                $task->reviewers()->sync(
                    collect($reviewers)->mapWithKeys(fn ($id) => [
                        $id => ['review_status' => 'pending']
                    ])->toArray()
                );
            }

            // Sync tags
            if (! empty($tags)) {
                $task->tags()->sync($tags);
            }

            $this->activityService->log('created', $task, auth()->user());
            $this->projectRepo->invalidateCache($task->project_id);

            // Auto-start timer only when task created with working_on status
            if ($task->status === 'working_on' && auth()->check()) {
                $this->autoStartTimer($task, auth()->id());
            }

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

                // Auto-start timer when moved to working_on
                if ($data['status'] === 'working_on' && $oldStatus !== 'working_on' && auth()->check()) {
                    $this->autoStartTimer($task, auth()->id());
                }

                // Auto-stop timer when moved away from working_on
                if ($oldStatus === 'working_on' && $data['status'] !== 'working_on' && auth()->check()) {
                    $this->autoStopTimer($task, auth()->id());
                }
            }

            // Normalize _ids aliases from frontend
            if (array_key_exists('assignee_ids', $data)) $data['assignees']   = $data['assignee_ids'];
            if (array_key_exists('tag_ids', $data))      $data['tags']        = $data['tag_ids'];
            $watchers = $data['watcher_ids'] ?? null;

            // Sync assignees
            if (isset($data['assignees'])) {
                $old = $task->assignees->pluck('id')->toArray();
                $task->assignees()->sync($data['assignees']);
                $new = array_diff($data['assignees'], $old);
                foreach ($new as $assigneeId) {
                    event(new TaskAssigned($task, $assigneeId));
                }
            }

            if (isset($watchers)) {
                $task->watchers()->sync($watchers);
            }

            // Sync reviewers
            if (isset($data['reviewer_ids'])) {
                $task->reviewers()->sync(
                    collect($data['reviewer_ids'])->mapWithKeys(fn ($id) => [
                        $id => ['review_status' => 'pending']
                    ])->toArray()
                );
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

        // Auto-start timer when moved to "working_on"
        if ($status === 'working_on' && $old !== 'working_on' && auth()->check()) {
            $this->autoStartTimer($task, auth()->id());
        }

        // Auto-stop timer when moved away from "working_on"
        if ($old === 'working_on' && $status !== 'working_on' && auth()->check()) {
            $this->autoStopTimer($task, auth()->id());
        }

        if ($old !== $status) {
            event(new TaskStatusChanged($task, $old, $status));
            $this->activityService->log('status_changed', $task, auth()->user(), [
                'from' => $old, 'to' => $status,
            ]);
        }

        $this->projectRepo->invalidateCache($task->project_id);

        return $task;
    }

    private function autoStartTimer(Task $task, int $userId): void
    {
        // Stop any existing active timer for this user
        TaskTimeLog::where('user_id', $userId)
            ->where('status', 'active')
            ->each(function ($log) {
                $log->update([
                    'status'   => 'stopped',
                    'end_time' => now(),
                    'duration' => now()->diffInSeconds($log->start_time) - ($log->paused_duration ?? 0),
                ]);
            });

        TaskTimeLog::create([
            'task_id'         => $task->id,
            'user_id'         => $userId,
            'start_time'      => now(),
            'status'          => 'active',
            'paused_duration' => 0,
            'is_manual'       => false,
        ]);
    }

    private function autoStopTimer(Task $task, int $userId): void
    {
        TaskTimeLog::where('task_id', $task->id)
            ->where('user_id', $userId)
            ->where('status', 'active')
            ->each(function ($log) {
                $duration = now()->diffInSeconds($log->start_time) - ($log->paused_duration ?? 0);
                $log->update([
                    'status'   => 'stopped',
                    'end_time' => now(),
                    'duration' => max(0, $duration),
                ]);
                $log->task->increment('total_time_spent', max(0, $duration));
            });
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
