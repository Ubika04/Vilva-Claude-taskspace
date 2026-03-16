<?php

namespace App\Listeners;

use App\Events\UserMentioned;
use App\Notifications\UserMentionedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendMentionNotification implements ShouldQueue
{
    public string $queue = 'notifications';

    public function handle(UserMentioned $event): void
    {
        $event->mentionedUser->notify(
            new UserMentionedNotification($event->task, $event->comment, $event->mentionedUser)
        );
    }
}
