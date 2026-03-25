<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tags = Tag::query()
            ->when($request->q, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy('name')
            ->limit(30)
            ->get(['id', 'name', 'color']);

        return response()->json($tags);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:50',
            'color'      => 'sometimes|string|max:20',
            'project_id' => 'sometimes|nullable|integer|exists:projects,id',
        ]);

        $tag = Tag::firstOrCreate(
            ['name' => $validated['name']],
            ['color' => $validated['color'] ?? '#6366f1', 'project_id' => $validated['project_id'] ?? null]
        );

        return response()->json($tag, 201);
    }
}
