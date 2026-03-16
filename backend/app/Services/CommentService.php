<?php

namespace App\Services;

use App\Events\UserMentioned;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;

class CommentService
{
    public function __construct(
        private readonly ActivityService $activityService,
    ) {}

    public function create(Task $task, array $data, int $userId): TaskComment
    {
        $mentions = $this->extractMentions($data['body']);

        $comment = TaskComment::create([
            'task_id'   => $task->id,
            'user_id'   => $userId,
            'parent_id' => $data['parent_id'] ?? null,
            'body'      => $data['body'],
            'mentions'  => $mentions,
        ]);

        // Fire mention events
        foreach ($mentions as $mention) {
            $user = User::where('name', $mention['username'])->first();
            if ($user && $user->id !== $userId) {
                event(new UserMentioned($task, $comment, $user));
            }
        }

        $this->activityService->log('comment_added', $task, auth()->user(), [
            'comment_id' => $comment->id,
        ]);

        return $comment->load('user:id,name,avatar');
    }

    public function update(TaskComment $comment, string $body): TaskComment
    {
        $comment->update([
            'body'      => $body,
            'is_edited' => true,
            'edited_at' => now(),
        ]);

        return $comment->fresh()->load('user:id,name,avatar');
    }

    public function delete(TaskComment $comment): void
    {
        $comment->delete();
    }

    private function extractMentions(string $body): array
    {
        preg_match_all('/@([\w.-]+)/', $body, $matches);
        return array_map(fn($m) => ['username' => $m], $matches[1]);
    }
}
