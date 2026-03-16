<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Repositories\TaskRepository;
use App\Repositories\TimerRepository;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskTimeLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __construct(
        private readonly TaskRepository  $taskRepo,
        private readonly TimerRepository $timerRepo,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $userId = auth()->id();

        $data = Cache::remember("dashboard:{$userId}", 60, function () use ($userId) {
            return [
                'my_tasks'          => $this->getMyTasks($userId),
                'overdue'           => $this->getOverdue($userId),
                'project_progress'  => $this->getProjectProgress($userId),
                'weekly_stats'      => $this->getWeeklyStats($userId),
            ];
        });

        // Active timer is real-time, never cached
        $data['active_timer'] = $this->timerRepo->getActiveTimerForUser($userId)?->load('task:id,title');

        return response()->json($data);
    }

    private function getMyTasks(int $userId): array
    {
        return Task::whereHas('assignees', fn($q) => $q->where('users.id', $userId))
            ->whereIn('status', ['todo', 'in_progress', 'review'])
            ->with(['project:id,name,color', 'tags'])
            ->orderByRaw("FIELD(status, 'in_progress', 'review', 'todo')")
            ->orderBy('due_date')
            ->limit(10)
            ->get()
            ->toArray();
    }

    private function getOverdue(int $userId): array
    {
        return Task::whereHas('assignees', fn($q) => $q->where('users.id', $userId))
            ->where('due_date', '<', now()->toDateString())
            ->whereNotIn('status', ['completed'])
            ->with(['project:id,name,color'])
            ->orderBy('due_date')
            ->get()
            ->toArray();
    }

    private function getProjectProgress(int $userId): array
    {
        return Project::where(function ($q) use ($userId) {
                $q->where('owner_id', $userId)
                  ->orWhereHas('members', fn($m) => $m->where('users.id', $userId));
            })
            ->where('status', 'active')
            ->withCount([
                'tasks',
                'tasks as completed_count' => fn($q) => $q->where('status', 'completed'),
            ])
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'id'       => $p->id,
                'name'     => $p->name,
                'color'    => $p->color,
                'progress' => $p->progress,
                'total'    => $p->tasks_count,
                'done'     => $p->completed_count,
            ])
            ->toArray();
    }

    private function getWeeklyStats(int $userId): array
    {
        $week = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $week->put($date, ['date' => $date, 'seconds' => 0, 'tasks_done' => 0]);
        }

        // Time tracked per day
        TaskTimeLog::where('user_id', $userId)
            ->where('status', 'stopped')
            ->whereBetween('start_time', [now()->subDays(6)->startOfDay(), now()->endOfDay()])
            ->get()
            ->groupBy(fn($l) => $l->start_time->toDateString())
            ->each(function ($logs, $date) use (&$week) {
                if ($week->has($date)) {
                    $week[$date]['seconds'] = $logs->sum('duration');
                }
            });

        // Tasks completed per day
        Task::whereHas('assignees', fn($q) => $q->where('users.id', $userId))
            ->where('status', 'completed')
            ->whereBetween('completed_at', [now()->subDays(6)->startOfDay(), now()->endOfDay()])
            ->get()
            ->groupBy(fn($t) => $t->completed_at->toDateString())
            ->each(function ($tasks, $date) use (&$week) {
                if ($week->has($date)) {
                    $week[$date]['tasks_done'] = $tasks->count();
                }
            });

        return $week->values()->toArray();
    }
}
