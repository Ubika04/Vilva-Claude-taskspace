<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Goal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GoalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $goals = Goal::where('user_id', $request->user()->id)
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderBy('due_date')
            ->get();

        return response()->json(['data' => $goals]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string',
            'target_value'  => 'required|numeric|min:1',
            'current_value' => 'nullable|numeric|min:0',
            'unit'          => 'nullable|string|max:50',
            'start_date'    => 'nullable|date',
            'due_date'      => 'nullable|date',
            'color'         => 'nullable|string|max:7',
        ]);

        $goal = Goal::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($goal, 201);
    }

    public function update(Request $request, Goal $goal): JsonResponse
    {
        if ($goal->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'title'         => 'sometimes|string|max:255',
            'description'   => 'nullable|string',
            'target_value'  => 'sometimes|numeric|min:1',
            'current_value' => 'sometimes|numeric|min:0',
            'unit'          => 'nullable|string|max:50',
            'start_date'    => 'nullable|date',
            'due_date'      => 'nullable|date',
            'status'        => 'sometimes|in:active,completed,paused',
            'color'         => 'nullable|string|max:7',
        ]);

        // Auto-complete when current >= target
        if (isset($validated['current_value']) && $validated['current_value'] >= ($validated['target_value'] ?? $goal->target_value)) {
            $validated['status'] = 'completed';
        }

        $goal->update($validated);

        return response()->json($goal->fresh());
    }

    public function destroy(Request $request, Goal $goal): JsonResponse
    {
        if ($goal->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $goal->delete();

        return response()->json(['message' => 'Goal deleted.']);
    }
}
