<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    /** Admins bypass all checks */
    public function before(User $user, string $ability): ?bool
    {
        if (isset($user->role) && $user->role === 'admin') return true;
        return null;
    }

    public function view(User $user, Project $project): bool
    {
        if ($project->visibility === 'public') return true;

        return $project->owner_id === $user->id
            || $project->members()->where('users.id', $user->id)->exists();
    }

    public function update(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id
            || $project->members()->where('users.id', $user->id)->exists();
    }

    public function delete(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id;
    }

    public function manageMembers(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id
            || $project->members()->where('users.id', $user->id)->exists();
    }
}
