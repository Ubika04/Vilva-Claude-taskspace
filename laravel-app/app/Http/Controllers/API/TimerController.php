<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Repositories\TimerRepository;
use App\Services\TimerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimerController extends Controller
{
    public function __construct(
        private readonly TimerService    $timerService,
        private readonly TimerRepository $timerRepo,
    ) {}

    public function start(Task $task): JsonResponse
    {
        $this->authorize('view', $task->project);

        try {
            $log = $this->timerService->start($task, auth()->id());
            return response()->json($log, 201);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }
    }

    public function pause(Task $task): JsonResponse
    {
        try {
            $log = $this->timerService->pause($task, auth()->id());
            return response()->json($log);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function resume(Task $task): JsonResponse
    {
        try {
            $log = $this->timerService->resume($task, auth()->id());
            return response()->json($log);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function stop(Request $request, Task $task): JsonResponse
    {
        $request->validate(['notes' => 'nullable|string|max:500']);

        try {
            $log = $this->timerService->stop($task, auth()->id(), $request->notes);
            return response()->json($log);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function addManual(Request $request, Task $task): JsonResponse
    {
        $request->validate([
            'start_time' => 'required|date',
            'end_time'   => 'required|date|after:start_time',
            'notes'      => 'nullable|string|max:500',
        ]);

        $log = $this->timerService->addManual($task, auth()->id(), $request->all());

        return response()->json($log, 201);
    }

    public function logs(Task $task): JsonResponse
    {
        $logs = $this->timerRepo->getLogsForTask($task->id);

        return response()->json($logs);
    }

    public function active(): JsonResponse
    {
        $timer = $this->timerRepo->getActiveTimerForUser(auth()->id());

        return response()->json($timer ? $timer->load('task:id,title,project_id') : null);
    }
}
