<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Services\DependencyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DependencyController extends Controller
{
    public function __construct(
        private readonly DependencyService $dependencyService,
    ) {}

    public function store(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task->project);

        $request->validate([
            'depends_on_id' => 'required|integer|exists:tasks,id',
            'type'          => 'nullable|string|in:finish_to_start,start_to_start,finish_to_finish,start_to_finish',
        ]);

        try {
            $dependency = $this->dependencyService->add(
                $task,
                Task::findOrFail($request->depends_on_id),
                $request->type ?? 'finish_to_start'
            );

            return response()->json($dependency->load('dependsOn:id,title,status'), 201);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function destroy(Task $task, int $dependsOnId): JsonResponse
    {
        $this->authorize('update', $task->project);

        $this->dependencyService->remove($task, $dependsOnId);

        return response()->json(['message' => 'Dependency removed.']);
    }

    public function index(Task $task): JsonResponse
    {
        return response()->json([
            'blocked_by' => $task->blockedBy()->select('tasks.id', 'title', 'status')->get(),
            'blocking'   => $task->blocking()->select('tasks.id', 'title', 'status')->get(),
            'is_blocked' => $task->isBlocked(),
        ]);
    }
}
