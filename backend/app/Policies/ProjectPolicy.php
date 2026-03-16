<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function view(User $user, Project $project): bool
    {
        if ($project->visibility === 'public') return true;

        return $project->owner_id === $user->id
            || $project->members()->where('users.id', $user->id)->exists();
    }

    public function update(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id
            || $this->userHasProjectRole($user, $project, ['owner', 'admin', 'manager']);
    }

    public function delete(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id
            || $user->hasRole('admin');
    }

    public function manageMembers(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id
            || $this->userHasProjectRole($user, $project, ['owner', 'admin', 'manager']);
    }

    private function userHasProjectRole(User $user, Project $project, array $roles): bool
    {
        return $project->members()
            ->where('users.id', $user->id)
            ->whereHas('pivot.role', fn($q) => $q->whereIn('name', $roles))
            ->exists();
    }
}
