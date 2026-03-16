<?php

namespace App\Listeners;

use App\Events\TaskStatusChanged;
use App\Notifications\TaskStatusChangedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendTaskStatusChangedNotification implements ShouldQueue
{
    public string $queue = 'notifications';

    public function handle(TaskStatusChanged $event): void
    {
        $task = $event->task->load('watchers', 'assignees');

        $notifyUsers = $task->watchers->merge($task->assignees)->unique('id');

        foreach ($notifyUsers as $user) {
            if ($user->id !== auth()->id()) {
                $user->notify(new TaskStatusChangedNotification($task, $event->oldStatus, $event->newStatus));
            }
        }
    }
}
