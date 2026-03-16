<?php

namespace App\Jobs;

use App\Models\Task;
use App\Notifications\DeadlineApproachingNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendDeadlineReminders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public string $queue = 'notifications';

    public function handle(): void
    {
        // Tasks due in 24 hours
        $tasks = Task::whereNotIn('status', ['completed'])
            ->whereNotNull('due_date')
            ->whereBetween('due_date', [now(), now()->addHours(24)])
            ->with('assignees')
            ->get();

        foreach ($tasks as $task) {
            $hoursUntilDue = (int) now()->diffInHours($task->due_date->endOfDay());

            foreach ($task->assignees as $user) {
                $user->notify(new DeadlineApproachingNotification($task, $hoursUntilDue));
            }
        }
    }
}
