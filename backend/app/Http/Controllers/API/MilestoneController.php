<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Milestone;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MilestoneController extends Controller
{
    public function index(Project $project): JsonResponse
    {
        $milestones = $project->milestones()
            ->with('creator:id,name,avatar')
            ->orderBy('due_date')
            ->get();

        return response()->json(['data' => $milestones]);
    }

    public function store(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date'    => 'nullable|date',
            'color'       => 'nullable|string|max:7',
        ]);

        $milestone = $project->milestones()->create([
            ...$validated,
            'created_by' => $request->user()->id,
        ]);

        return response()->json($milestone->load('creator:id,name,avatar'), 201);
    }

    public function update(Request $request, Project $project, Milestone $milestone): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'due_date'    => 'nullable|date',
            'color'       => 'nullable|string|max:7',
            'status'      => 'sometimes|in:open,completed',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'completed' && $milestone->status !== 'completed') {
            $validated['completed_at'] = now();
        } elseif (isset($validated['status']) && $validated['status'] === 'open') {
            $validated['completed_at'] = null;
        }

        $milestone->update($validated);

        return response()->json($milestone->fresh()->load('creator:id,name,avatar'));
    }

    public function destroy(Project $project, Milestone $milestone): JsonResponse
    {
        $milestone->delete();

        return response()->json(['message' => 'Milestone deleted.']);
    }
}
