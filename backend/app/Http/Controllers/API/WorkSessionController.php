<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\WorkSessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkSessionController extends Controller
{
    public function __construct(
        private readonly WorkSessionService $workSessionService,
    ) {}

    /**
     * POST /work-sessions/clock-in
     */
    public function clockIn(Request $request): JsonResponse
    {
        try {
            $session = $this->workSessionService->clockIn(
                $request->user()->id,
                $request->input('notes'),
                $request->ip(),
            );

            return response()->json([
                'message' => 'Clocked in successfully',
                'session' => $this->formatSession($session),
            ], 201);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }
    }

    /**
     * POST /work-sessions/clock-out
     */
    public function clockOut(Request $request): JsonResponse
    {
        try {
            $session = $this->workSessionService->clockOut(
                $request->user()->id,
                $request->input('notes'),
            );

            return response()->json([
                'message' => 'Clocked out successfully',
                'session' => $this->formatSession($session),
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * POST /work-sessions/break/start
     */
    public function startBreak(Request $request): JsonResponse
    {
        try {
            $break = $this->workSessionService->startBreak(
                $request->user()->id,
                $request->input('reason'),
            );

            return response()->json([
                'message' => 'Break started',
                'break'   => [
                    'id'         => $break->id,
                    'start_time' => $break->start_time->toISOString(),
                    'reason'     => $break->reason,
                ],
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * POST /work-sessions/break/end
     */
    public function endBreak(Request $request): JsonResponse
    {
        try {
            $break = $this->workSessionService->endBreak($request->user()->id);

            return response()->json([
                'message'  => 'Break ended',
                'break'    => [
                    'id'         => $break->id,
                    'start_time' => $break->start_time->toISOString(),
                    'end_time'   => $break->end_time->toISOString(),
                    'duration'   => $break->duration_minutes,
                ],
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * GET /work-sessions/active — Current session status
     */
    public function active(Request $request): JsonResponse
    {
        $session = $this->workSessionService->getActiveSession($request->user()->id);

        if (!$session) {
            return response()->json(['session' => null]);
        }

        return response()->json(['session' => $this->formatSession($session)]);
    }

    /**
     * GET /work-sessions/history — Past sessions (paginated)
     */
    public function history(Request $request): JsonResponse
    {
        $sessions = $this->workSessionService->getHistory(
            $request->user()->id,
            $request->input('from'),
            $request->input('to'),
            $request->integer('per_page', 20),
        );

        return response()->json($sessions);
    }

    /**
     * GET /work-sessions/summary — Aggregated stats for date range
     */
    public function summary(Request $request): JsonResponse
    {
        $request->validate([
            'from' => 'required|date',
            'to'   => 'required|date|after_or_equal:from',
        ]);

        $summary = $this->workSessionService->getSummary(
            $request->user()->id,
            $request->input('from'),
            $request->input('to'),
        );

        return response()->json($summary);
    }

    /**
     * GET /work-sessions/team — Active team sessions (admin/lead view)
     */
    public function team(Request $request): JsonResponse
    {
        $sessions = $this->workSessionService->getActiveTeamSessions();
        return response()->json(['sessions' => $sessions]);
    }

    private function formatSession($session): array
    {
        return [
            'id'              => $session->id,
            'clock_in'        => $session->clock_in->toISOString(),
            'clock_out'       => $session->clock_out?->toISOString(),
            'status'          => $session->status,
            'elapsed_minutes' => $session->elapsed_minutes,
            'break_minutes'   => $session->break_minutes,
            'total_minutes'   => $session->total_minutes,
            'notes'           => $session->notes,
            'breaks'          => $session->breaks->map(fn ($b) => [
                'id'         => $b->id,
                'start_time' => $b->start_time->toISOString(),
                'end_time'   => $b->end_time?->toISOString(),
                'reason'     => $b->reason,
                'duration'   => $b->duration_minutes,
            ]),
        ];
    }
}
