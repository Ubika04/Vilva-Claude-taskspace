<?php

namespace App\Notifications;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DeadlineApproachingNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Task $task,
        private readonly int  $hoursUntilDue,
    ) {}

    public function via(object $notifiable): array { return ['database']; }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'       => 'deadline_approaching',
            'task_id'    => $this->task->id,
            'task_title' => $this->task->title,
            'project_id' => $this->task->project_id,
            'due_date'   => $this->task->due_date->toDateString(),
            'message'    => "Task \"{$this->task->title}\" is due in {$this->hoursUntilDue} hours",
            'url'        => "/projects/{$this->task->project_id}/tasks/{$this->task->id}",
        ];
    }
}
