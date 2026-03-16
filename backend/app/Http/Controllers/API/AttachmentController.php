<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskAttachment;
use App\Services\AttachmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttachmentController extends Controller
{
    public function __construct(
        private readonly AttachmentService $attachmentService,
    ) {}

    public function store(Request $request, Task $task): JsonResponse
    {
        $this->authorize('view', $task->project);

        $request->validate([
            'file' => 'required|file|max:25600', // 25MB
        ]);

        try {
            $attachment = $this->attachmentService->upload($task, $request->file('file'), auth()->id());
            return response()->json($attachment, 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function download(TaskAttachment $attachment): JsonResponse
    {
        $this->authorize('view', $attachment->task->project);

        return response()->json([
            'url'      => $this->attachmentService->getTemporaryUrl($attachment),
            'expires'  => now()->addMinutes(30)->toIso8601String(),
        ]);
    }

    public function destroy(TaskAttachment $attachment): JsonResponse
    {
        if ($attachment->user_id !== auth()->id()) {
            $this->authorize('update', $attachment->task->project);
        }

        $this->attachmentService->delete($attachment);

        return response()->json(['message' => 'Attachment deleted.']);
    }
}
