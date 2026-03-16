<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * GET /api/v1/admin/users
     * Returns all users with their assigned tasks and task stats.
     * Admin-only endpoint.
     */
    public function users(Request $request): JsonResponse
    {
        if (! $request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Forbidden. Admin access required.'], 403);
        }

        $users = User::with([
            'roles',
            'assignedTasks' => fn ($q) => $q->with('project:id,name,color')
                ->select('tasks.id', 'tasks.title', 'tasks.status', 'tasks.priority', 'tasks.due_date', 'tasks.project_id'),
        ])->get();

        $now  = now();
        $data = $users->map(function ($user) use ($now) {
            $tasks = $user->assignedTasks;

            return [
                'id'             => $user->id,
                'name'           => $user->name,
                'email'          => $user->email,
                'avatar_url'     => $user->avatar_url,
                'status'         => $user->status,
                'last_active_at' => $user->last_active_at,
                'roles'          => $user->roles->pluck('name'),
                'task_stats'     => [
                    'total'       => $tasks->count(),
                    'in_progress' => $tasks->where('status', 'in_progress')->count(),
                    'completed'   => $tasks->where('status', 'completed')->count(),
                    'overdue'     => $tasks->filter(
                        fn ($t) => $t->due_date && $now->isAfter($t->due_date) && $t->status !== 'completed'
                    )->count(),
                ],
                'tasks' => $tasks->map(fn ($t) => [
                    'id'       => $t->id,
                    'title'    => $t->title,
                    'status'   => $t->status,
                    'priority' => $t->priority,
                    'due_date' => $t->due_date,
                    'project'  => $t->project ? [
                        'id'    => $t->project->id,
                        'name'  => $t->project->name,
                        'color' => $t->project->color,
                    ] : null,
                ]),
            ];
        });

        return response()->json(['data' => $data]);
    }
}
