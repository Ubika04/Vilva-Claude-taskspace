<?php

namespace App\Notifications;

use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class UserMentionedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Task        $task,
        private readonly TaskComment $comment,
        private readonly User        $mentionedUser,
    ) {}

    public function via(object $notifiable): array { return ['database']; }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'       => 'user_mentioned',
            'task_id'    => $this->task->id,
            'task_title' => $this->task->title,
            'project_id' => $this->task->project_id,
            'comment_id' => $this->comment->id,
            'message'    => "You were mentioned in a comment on \"{$this->task->title}\"",
            'url'        => "/projects/{$this->task->project_id}/tasks/{$this->task->id}#comment-{$this->comment->id}",
        ];
    }
}
