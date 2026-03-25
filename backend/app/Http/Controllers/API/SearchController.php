<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $q = trim($request->get('q', ''));

        if (strlen($q) < 2) {
            return response()->json(['tasks' => [], 'projects' => []]);
        }

        $userId = auth()->id();

        $accessibleProjectIds = Project::where(function ($query) use ($userId) {
            $query->where('owner_id', $userId)
                  ->orWhereHas('members', fn ($q) => $q->where('user_id', $userId));
        })->pluck('id');

        $tasks = Task::with('project:id,name,color')
            ->whereIn('project_id', $accessibleProjectIds)
            ->where('title', 'like', "%{$q}%")
            ->whereNull('parent_id')
            ->where('is_archived', false)
            ->select('id', 'title', 'status', 'priority', 'project_id', 'due_date')
            ->limit(8)
            ->get();

        $projects = Project::whereIn('id', $accessibleProjectIds)
            ->where('name', 'like', "%{$q}%")
            ->select('id', 'name', 'color', 'status')
            ->limit(5)
            ->get();

        return response()->json([
            'tasks'    => $tasks,
            'projects' => $projects,
        ]);
    }
}
