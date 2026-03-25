<?php

namespace App\Services;

use App\Models\WorkSession;
use App\Models\WorkSessionBreak;
use DomainException;
use Illuminate\Support\Facades\DB;

class WorkSessionService
{
    /**
     * Clock in — start a new work session.
     */
    public function clockIn(int $userId, ?string $notes = null, ?string $ipAddress = null): WorkSession
    {
        // Check for existing active session
        $active = WorkSession::where('user_id', $userId)
            ->whereIn('status', ['active', 'on_break'])
            ->first();

        if ($active) {
            throw new DomainException('You already have an active work session. Clock out first.');
        }

        return WorkSession::create([
            'user_id'    => $userId,
            'clock_in'   => now(),
            'status'     => 'active',
            'notes'      => $notes,
            'ip_address' => $ipAddress,
        ]);
    }

    /**
     * Clock out — end the current work session.
     */
    public function clockOut(int $userId, ?string $notes = null): WorkSession
    {
        $session = $this->getActiveSession($userId);
        if (!$session) {
            throw new DomainException('No active work session to clock out from.');
        }

        // End any active break
        if ($session->status === 'on_break') {
            $this->endBreak($userId);
            $session->refresh();
        }

        $totalBreakMinutes = $session->breaks()->sum(
            DB::raw('TIMESTAMPDIFF(MINUTE, start_time, COALESCE(end_time, NOW()))')
        ) ?: $session->break_minutes;

        $totalMinutes = max(0, (int) $session->clock_in->diffInMinutes(now()) - $totalBreakMinutes);

        $session->update([
            'clock_out'     => now(),
            'status'        => 'completed',
            'break_minutes' => $totalBreakMinutes,
            'total_minutes' => $totalMinutes,
            'notes'         => $notes ?? $session->notes,
        ]);

        return $session;
    }

    /**
     * Start a break within the current session.
     */
    public function startBreak(int $userId, ?string $reason = null): WorkSessionBreak
    {
        $session = $this->getActiveSession($userId);
        if (!$session) {
            throw new DomainException('No active work session.');
        }
        if ($session->status === 'on_break') {
            throw new DomainException('Already on a break.');
        }

        $session->update(['status' => 'on_break']);

        return WorkSessionBreak::create([
            'work_session_id' => $session->id,
            'start_time'      => now(),
            'reason'          => $reason,
        ]);
    }

    /**
     * End the current break.
     */
    public function endBreak(int $userId): WorkSessionBreak
    {
        $session = $this->getActiveSession($userId);
        if (!$session || $session->status !== 'on_break') {
            throw new DomainException('Not currently on a break.');
        }

        $activeBreak = $session->breaks()->whereNull('end_time')->first();
        if (!$activeBreak) {
            throw new DomainException('No active break found.');
        }

        $activeBreak->update(['end_time' => now()]);

        $breakMinutes = (int) $activeBreak->start_time->diffInMinutes($activeBreak->end_time);
        $session->increment('break_minutes', $breakMinutes);
        $session->update(['status' => 'active']);

        return $activeBreak;
    }

    /**
     * Get the user's active work session.
     */
    public function getActiveSession(int $userId): ?WorkSession
    {
        return WorkSession::where('user_id', $userId)
            ->whereIn('status', ['active', 'on_break'])
            ->with('breaks')
            ->first();
    }

    /**
     * Get work session history for a user.
     */
    public function getHistory(int $userId, ?string $from = null, ?string $to = null, int $perPage = 20)
    {
        $query = WorkSession::where('user_id', $userId)
            ->with('breaks')
            ->orderByDesc('clock_in');

        if ($from) $query->where('clock_in', '>=', $from);
        if ($to) $query->where('clock_in', '<=', $to);

        return $query->paginate($perPage);
    }

    /**
     * Get summary stats for a user's work sessions in a date range.
     */
    public function getSummary(int $userId, string $from, string $to): array
    {
        $sessions = WorkSession::where('user_id', $userId)
            ->where('status', 'completed')
            ->where('clock_in', '>=', $from)
            ->where('clock_in', '<=', $to)
            ->get();

        $totalMinutes = $sessions->sum('total_minutes');
        $totalBreaks  = $sessions->sum('break_minutes');
        $sessionCount = $sessions->count();
        $avgMinutes   = $sessionCount > 0 ? round($totalMinutes / $sessionCount) : 0;

        // Daily breakdown
        $daily = $sessions->groupBy(fn ($s) => $s->clock_in->format('Y-m-d'))
            ->map(fn ($group) => [
                'date'          => $group->first()->clock_in->format('Y-m-d'),
                'sessions'      => $group->count(),
                'total_minutes' => $group->sum('total_minutes'),
                'break_minutes' => $group->sum('break_minutes'),
            ])->values();

        return [
            'total_hours'     => round($totalMinutes / 60, 1),
            'total_minutes'   => $totalMinutes,
            'total_breaks'    => $totalBreaks,
            'session_count'   => $sessionCount,
            'avg_session_min' => $avgMinutes,
            'daily'           => $daily,
        ];
    }

    /**
     * Get all active sessions (for admin/team lead view).
     */
    public function getActiveTeamSessions(?int $projectId = null)
    {
        $query = WorkSession::whereIn('status', ['active', 'on_break'])
            ->with(['user:id,name,avatar,email', 'breaks' => fn ($q) => $q->whereNull('end_time')]);

        return $query->get()->map(function ($session) {
            return [
                'id'              => $session->id,
                'user'            => $session->user,
                'clock_in'        => $session->clock_in->toISOString(),
                'status'          => $session->status,
                'elapsed_minutes' => $session->elapsed_minutes,
                'break_minutes'   => $session->break_minutes,
                'current_break'   => $session->current_break,
            ];
        });
    }
}
