<?php

namespace App\Listeners;

use App\Events\TaskAssigned;
use App\Models\User;
use App\Notifications\TaskAssignedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendTaskAssignedNotification implements ShouldQueue
{
    public string $queue = 'notifications';

    public function handle(TaskAssigned $event): void
    {
        $user = User::find($event->assigneeId);

        if ($user && $user->id !== auth()->id()) {
            $user->notify(new TaskAssignedNotification($event->task));
        }
    }
}
