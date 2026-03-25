<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function view(User $user, Project $project): bool
    {
        if ($project->visibility === 'public') return true;
        if ($user->hasRole('admin')) return true;

        return $project->owner_id === $user->id
            || $project->members()->where('users.id', $user->id)->exists()
            || $this->isAssignedToProjectTask($user, $project);
    }

    public function update(User $user, Project $project): bool
    {
        if ($user->hasRole('admin')) return true;

        return $project->owner_id === $user->id
            || $project->members()->where('users.id', $user->id)->exists()
            || $this->isAssignedToProjectTask($user, $project);
    }

    public function delete(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id
            || $user->hasRole('admin');
    }

    public function manageMembers(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id
            || $user->hasRole('admin');
    }

    /**
     * Check if user is assigned to any task in this project,
     * or is a reviewer/watcher, or has a dependency on a task in this project.
     */
    private function isAssignedToProjectTask(User $user, Project $project): bool
    {
        return $project->tasks()
            ->where(function ($q) use ($user) {
                $q->whereHas('assignees', fn ($a) => $a->where('users.id', $user->id))
                  ->orWhereHas('reviewers', fn ($r) => $r->where('users.id', $user->id))
                  ->orWhereHas('watchers', fn ($w) => $w->where('users.id', $user->id));
            })
            ->exists();
    }
}
