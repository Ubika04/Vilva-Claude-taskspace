<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskComment;
use App\Services\CommentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function __construct(
        private readonly CommentService $commentService,
    ) {}

    public function index(Task $task): JsonResponse
    {
        $this->authorize('view', $task->project);

        $comments = $task->comments()->with([
            'user:id,name,avatar',
            'replies.user:id,name,avatar',
        ])->get();

        return response()->json($comments);
    }

    public function store(Request $request, Task $task): JsonResponse
    {
        $this->authorize('view', $task->project);

        $request->validate([
            'body'      => 'required|string|max:10000',
            'parent_id' => 'nullable|integer|exists:task_comments,id',
        ]);

        $comment = $this->commentService->create($task, $request->all(), auth()->id());

        return response()->json($comment, 201);
    }

    public function update(Request $request, TaskComment $comment): JsonResponse
    {
        if ($comment->user_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $request->validate(['body' => 'required|string|max:10000']);

        $comment = $this->commentService->update($comment, $request->body);

        return response()->json($comment);
    }

    public function destroy(TaskComment $comment): JsonResponse
    {
        if ($comment->user_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $this->commentService->delete($comment);

        return response()->json(['message' => 'Comment deleted.']);
    }
}
