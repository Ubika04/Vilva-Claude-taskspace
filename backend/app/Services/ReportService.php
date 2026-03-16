<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskTimeLog;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class ReportService
{
    // ─── User Productivity Report ─────────────────────────────────────────────

    public function userProductivity(int $userId, string $from, string $to): array
    {
        $user = User::findOrFail($userId);

        $timeLogs = TaskTimeLog::where('user_id', $userId)
            ->where('status', 'stopped')
            ->whereBetween('start_time', [$from, $to])
            ->with('task:id,title,project_id,status')
            ->get();

        $tasksDone = Task::whereHas('assignees', fn($q) => $q->where('users.id', $userId))
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$from, $to])
            ->count();

        $byDay = $timeLogs->groupBy(fn($l) => $l->start_time->toDateString())
            ->map(fn($logs) => [
                'total_seconds' => $logs->sum('duration'),
                'task_count'    => $logs->unique('task_id')->count(),
            ]);

        return [
            'user'           => ['id' => $user->id, 'name' => $user->name],
            'period'         => ['from' => $from, 'to' => $to],
            'total_seconds'  => $timeLogs->sum('duration'),
            'tasks_completed'=> $tasksDone,
            'daily'          => $byDay,
            'time_logs'      => $timeLogs,
        ];
    }

    // ─── Project Progress Report ──────────────────────────────────────────────

    public function projectProgress(int $projectId): array
    {
        $project = Project::with('members:id,name,avatar')->findOrFail($projectId);

        $stats = Task::where('project_id', $projectId)
            ->whereNull('parent_id')
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $totalTime = TaskTimeLog::whereHas('task', fn($q) => $q->where('project_id', $projectId))
            ->where('status', 'stopped')
            ->sum('duration');

        $memberStats = DB::table('task_assignments')
            ->join('tasks', 'tasks.id', '=', 'task_assignments.task_id')
            ->join('users', 'users.id', '=', 'task_assignments.user_id')
            ->where('tasks.project_id', $projectId)
            ->select('users.id', 'users.name', DB::raw('count(*) as task_count'),
                     DB::raw('sum(case when tasks.status = "completed" then 1 else 0 end) as completed'))
            ->groupBy('users.id', 'users.name')
            ->get();

        return [
            'project'      => $project->only('id', 'name', 'status', 'due_date', 'progress'),
            'task_stats'   => $stats,
            'total_time'   => $totalTime,
            'member_stats' => $memberStats,
        ];
    }

    // ─── Time Tracking Report ─────────────────────────────────────────────────

    public function timeTracking(array $filters): array
    {
        $query = TaskTimeLog::query()
            ->where('status', 'stopped')
            ->with(['task:id,title,project_id', 'task.project:id,name', 'user:id,name'])
            ->when(isset($filters['project_id']), fn($q) => $q->whereHas('task', fn($t) =>
                $t->where('project_id', $filters['project_id'])))
            ->when(isset($filters['user_id']), fn($q) => $q->where('user_id', $filters['user_id']))
            ->when(isset($filters['from']),    fn($q) => $q->where('start_time', '>=', $filters['from']))
            ->when(isset($filters['to']),      fn($q) => $q->where('start_time', '<=', $filters['to']));

        $logs = $query->get();

        return [
            'logs'          => $logs,
            'total_seconds' => $logs->sum('duration'),
            'total_tasks'   => $logs->unique('task_id')->count(),
            'total_users'   => $logs->unique('user_id')->count(),
        ];
    }

    // ─── Export ───────────────────────────────────────────────────────────────

    public function exportCsv(array $data, string $filename): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        return response()->streamDownload(function () use ($data) {
            $fp = fopen('php://output', 'w');
            if (! empty($data)) {
                fputcsv($fp, array_keys((array) $data[0]));
                foreach ($data as $row) {
                    fputcsv($fp, (array) $row);
                }
            }
            fclose($fp);
        }, $filename . '.csv', ['Content-Type' => 'text/csv']);
    }
}
