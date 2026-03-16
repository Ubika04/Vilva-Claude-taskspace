<?php

namespace App\Notifications;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TaskStatusChangedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Task   $task,
        private readonly string $oldStatus,
        private readonly string $newStatus,
    ) {}

    public function via(object $notifiable): array { return ['database']; }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'       => 'task_status_changed',
            'task_id'    => $this->task->id,
            'task_title' => $this->task->title,
            'project_id' => $this->task->project_id,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'message'    => "Task \"{$this->task->title}\" moved to {$this->newStatus}",
            'url'        => "/projects/{$this->task->project_id}/tasks/{$this->task->id}",
        ];
    }
}
