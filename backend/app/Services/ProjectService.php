<?php

namespace App\Services;

use App\Events\ProjectCreated;
use App\Models\Project;
use App\Models\Role;
use App\Repositories\ProjectRepository;
use Illuminate\Support\Facades\DB;

class ProjectService
{
    public function __construct(
        private readonly ProjectRepository $projectRepo,
        private readonly ActivityService   $activityService,
        private readonly ChatService       $chatService,
    ) {}

    public function create(array $data, int $ownerId): Project
    {
        return DB::transaction(function () use ($data, $ownerId) {
            $project = $this->projectRepo->create([
                ...$data,
                'owner_id' => $ownerId,
            ]);

            // Auto-add owner as member with "owner" role
            $ownerRole = Role::firstOrCreate(
                ['name' => 'owner'],
                ['display_name' => 'Owner', 'description' => 'Project owner', 'is_system' => true]
            );
            $project->members()->attach($ownerId, [
                'role_id'   => $ownerRole->id,
                'joined_at' => now(),
            ]);

            // Add initial members if provided
            if (!empty($data['member_ids'])) {
                foreach ($data['member_ids'] as $memberId) {
                    if ($memberId != $ownerId) {
                        $project->members()->attach($memberId, ['role' => 'member']);
                    }
                }
            }

            $this->activityService->log('created', $project, auth()->user());
            event(new ProjectCreated($project));

            // Auto-create project chat channel
            $this->chatService->createProjectChannel($project, $ownerId);

            return $project->load('owner', 'members');
        });
    }

    public function update(Project $project, array $data): Project
    {
        $old = $project->only(['name', 'status', 'due_date', 'description']);

        $this->projectRepo->update($project, $data);
        $project->refresh();

        $this->activityService->log('updated', $project, auth()->user(), [
            'old' => $old,
            'new' => $project->only(array_keys($old)),
        ]);

        $this->projectRepo->invalidateCache($project->id);

        return $project;
    }

    public function delete(Project $project): void
    {
        $this->activityService->log('deleted', $project, auth()->user());
        $this->projectRepo->delete($project);
    }

    public function addMember(Project $project, int $userId, string $roleName): void
    {
        $role = Role::firstOrCreate(
            ['name' => $roleName],
            ['display_name' => ucfirst($roleName), 'description' => ucfirst($roleName) . ' role', 'is_system' => true]
        );

        $project->members()->syncWithoutDetaching([
            $userId => ['role_id' => $role->id, 'joined_at' => now()],
        ]);

        $this->activityService->log('member_added', $project, auth()->user(), ['user_id' => $userId]);

        // Sync chat channel members
        $this->chatService->syncProjectMembers($project);
    }

    public function removeMember(Project $project, int $userId): void
    {
        if ($project->owner_id === $userId) {
            throw new \RuntimeException('Cannot remove the project owner.');
        }

        $project->members()->detach($userId);
        $this->activityService->log('member_removed', $project, auth()->user(), ['user_id' => $userId]);

        // Sync chat channel members
        $this->chatService->syncProjectMembers($project);
    }
}
