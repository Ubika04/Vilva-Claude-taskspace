<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportService $reportService,
    ) {}

    public function userProductivity(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'nullable|integer|exists:users,id',
            'from'    => 'required|date',
            'to'      => 'required|date|after_or_equal:from',
        ]);

        $userId = $request->user_id ?? $request->user()->id;

        return response()->json(
            $this->reportService->userProductivity($userId, $request->from, $request->to)
        );
    }

    public function projectProgress(int $projectId): JsonResponse
    {
        return response()->json($this->reportService->projectProgress($projectId));
    }

    public function timeTracking(Request $request): JsonResponse
    {
        $request->validate([
            'project_id' => 'nullable|integer|exists:projects,id',
            'user_id'    => 'nullable|integer|exists:users,id',
            'from'       => 'nullable|date',
            'to'         => 'nullable|date',
        ]);

        return response()->json($this->reportService->timeTracking($request->all()));
    }

    /**
     * Velocity report — score points completed per week, per member.
     */
    public function velocity(Request $request): JsonResponse
    {
        $request->validate([
            'project_id' => 'required|integer|exists:projects,id',
            'from'       => 'required|date',
            'to'         => 'required|date|after_or_equal:from',
        ]);

        return response()->json(
            $this->reportService->velocity($request->project_id, $request->from, $request->to)
        );
    }

    public function exportCsv(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $request->validate([
            'type' => 'required|string|in:time_tracking,productivity',
            'from' => 'nullable|date',
            'to'   => 'nullable|date',
        ]);

        $data = match ($request->type) {
            'time_tracking' => $this->reportService->timeTracking($request->all())['logs']->toArray(),
            'productivity'  => $this->reportService->userProductivity(
                $request->user_id ?? auth()->id(),
                $request->from ?? now()->subMonth()->toDateString(),
                $request->to ?? now()->toDateString()
            )['time_logs']->toArray(),
        };

        return $this->reportService->exportCsv($data, $request->type . '_' . now()->toDateString());
    }
}
