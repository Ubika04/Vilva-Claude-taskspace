<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Repositories\ProjectRepository;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProjectController extends Controller
{
    public function __construct(
        private readonly ProjectService    $projectService,
        private readonly ProjectRepository $projectRepo,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $projects = $this->projectRepo->getForUser(auth()->id(), $request->only([
            'status', 'search', 'per_page',
        ]));

        return ProjectResource::collection($projects);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = $this->projectService->create($request->validated(), auth()->id());

        return response()->json(new ProjectResource($project), 201);
    }

    public function show(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $project = $this->projectRepo->findWithDetails($project->id);

        return response()->json(new ProjectResource($project));
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $project = $this->projectService->update($project, $request->validated());

        return response()->json(new ProjectResource($project));
    }

    public function destroy(Project $project): JsonResponse
    {
        $this->authorize('delete', $project);

        $this->projectService->delete($project);

        return response()->json(['message' => 'Project deleted.'], 200);
    }

    public function stats(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        return response()->json($this->projectRepo->getProgressStats($project->id));
    }

    public function addMember(Request $request, Project $project): JsonResponse
    {
        $this->authorize('manage-members', $project);

        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'role'    => 'required|string|in:admin,manager,member,guest',
        ]);

        $this->projectService->addMember($project, $request->user_id, $request->role);

        return response()->json(['message' => 'Member added.']);
    }

    public function removeMember(Request $request, Project $project, int $userId): JsonResponse
    {
        $this->authorize('manage-members', $project);

        $this->projectService->removeMember($project, $userId);

        return response()->json(['message' => 'Member removed.']);
    }
}
