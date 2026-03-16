<?php

namespace App\Services;

use App\Models\Task;
use App\Models\TaskDependency;

class DependencyService
{
    /**
     * Add a dependency: $task depends on $dependsOn.
     */
    public function add(Task $task, Task $dependsOn, string $type = 'finish_to_start'): TaskDependency
    {
        if ($task->id === $dependsOn->id) {
            throw new \DomainException('A task cannot depend on itself.');
        }

        // Circular dependency check
        if ($this->wouldCreateCycle($task->id, $dependsOn->id)) {
            throw new \DomainException('This dependency would create a circular dependency chain.');
        }

        return TaskDependency::firstOrCreate(
            ['task_id' => $task->id, 'depends_on_id' => $dependsOn->id],
            ['type' => $type]
        );
    }

    public function remove(Task $task, int $dependsOnId): void
    {
        TaskDependency::where('task_id', $task->id)
            ->where('depends_on_id', $dependsOnId)
            ->delete();
    }

    /**
     * DFS-based cycle detection.
     * Check if adding "task -> dependsOn" would create a cycle.
     */
    private function wouldCreateCycle(int $taskId, int $dependsOnId): bool
    {
        // If dependsOnId already depends (directly or transitively) on taskId → cycle
        return $this->canReach($dependsOnId, $taskId, []);
    }

    private function canReach(int $from, int $target, array $visited): bool
    {
        if ($from === $target) return true;
        if (in_array($from, $visited)) return false;

        $visited[] = $from;

        $nexts = TaskDependency::where('task_id', $from)->pluck('depends_on_id');

        foreach ($nexts as $next) {
            if ($this->canReach($next, $target, $visited)) {
                return true;
            }
        }

        return false;
    }
}
