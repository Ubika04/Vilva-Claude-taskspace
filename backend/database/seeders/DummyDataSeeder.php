<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        $users    = User::all();
        $admin    = User::where('email', 'admin@vilva.dev')->first() ?? $users->first();
        $tasks    = Task::with('project')->get();
        $taskIds  = $tasks->pluck('id')->toArray();
        $projects = DB::table('projects')->get();

        if ($tasks->isEmpty()) {
            $this->command->warn('No tasks found. Run AdminUserSeeder first.');
            return;
        }

        // ── 1. Tags (global — attached to first project as "workspace tags") ──
        $firstProjectId = $projects->first()->id;

        $tagsData = [
            ['name' => 'frontend',    'color' => '#6366f1'],
            ['name' => 'backend',     'color' => '#10b981'],
            ['name' => 'design',      'color' => '#ec4899'],
            ['name' => 'devops',      'color' => '#f59e0b'],
            ['name' => 'security',    'color' => '#ef4444'],
            ['name' => 'bug',         'color' => '#dc2626'],
            ['name' => 'feature',     'color' => '#2563eb'],
            ['name' => 'performance', 'color' => '#8b5cf6'],
            ['name' => 'docs',        'color' => '#64748b'],
            ['name' => 'testing',     'color' => '#14b8a6'],
            ['name' => 'mobile',      'color' => '#f97316'],
            ['name' => 'api',         'color' => '#0ea5e9'],
            ['name' => 'analytics',   'color' => '#7c3aed'],
            ['name' => 'marketing',   'color' => '#d946ef'],
            ['name' => 'urgent',      'color' => '#dc2626'],
            ['name' => 'research',    'color' => '#0d9488'],
        ];

        $tagIds = [];
        foreach ($tagsData as $td) {
            DB::table('tags')->insertOrIgnore(array_merge($td, [
                'project_id' => $firstProjectId,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
            $row = DB::table('tags')
                ->where('project_id', $firstProjectId)
                ->where('name', $td['name'])
                ->first();
            if ($row) $tagIds[] = $row->id;
        }

        // Tag assignments — each task gets 1-3 random tags
        foreach ($taskIds as $taskId) {
            $count  = rand(1, 3);
            $picked = array_rand($tagIds, min($count, count($tagIds)));
            foreach ((array) $picked as $idx) {
                DB::table('task_tags')->insertOrIgnore([
                    'task_id' => $taskId,
                    'tag_id'  => $tagIds[$idx],
                ]);
            }
        }

        $this->command->info('✓ Tags: ' . count($tagIds) . ' tags, ' . DB::table('task_tags')->count() . ' assignments');

        // ── 2. Task Comments ──────────────────────────────────────────────────
        $commentTemplates = [
            "I've started working on this. Will update once the first draft is ready.",
            "Just reviewed the requirements — looks straightforward. Should be done by EOD.",
            "Ran into a blocker with the API response format. Checking with @%s.",
            "Updated the design based on feedback from yesterday's review session.",
            "This is taking longer than estimated due to some unexpected edge cases.",
            "Done! PR is up for review: https://github.com/vilva/app/pull/%d",
            "Pushed a WIP commit. Let me know if the approach looks right.",
            "Can someone else take a look at this? I'm a bit stuck on the implementation.",
            "Left some notes in the ticket. Main risk is the third-party API rate limit.",
            "QA passed on staging. Ready to merge once approved.",
            "Blocked by task dependency — waiting on auth module to be completed first.",
            "Added unit tests and updated the documentation. Ready for review.",
            "Performance benchmarks look good — 40% faster than the previous implementation.",
            "Found a related bug while working on this. Created a separate ticket for it.",
            "Synced with the design team. Went with option B — cleaner and more accessible.",
            "This needs a bit more time. Moving the deadline to next sprint.",
            "Deployed to staging environment. Please test before we push to production.",
            "All acceptance criteria met. Closing this once the PR is merged.",
            "Great work on this! The implementation is clean and well-documented.",
            "Minor nit: we should add error handling for the edge case where the list is empty.",
            "Heads up — this might affect the billing module. Flagging for cross-team review.",
            "Re-scoped after the stakeholder call. Simplified the approach significantly.",
        ];

        $commentCount = 0;
        // Add 2-5 comments to about 60% of tasks
        foreach ($tasks->random((int) ($tasks->count() * 0.6)) as $task) {
            $numComments = rand(2, 5);
            $daysAgo     = rand(1, 10);
            $parentId    = null;

            for ($i = 0; $i < $numComments; $i++) {
                $user    = $users->random();
                $tpl     = $commentTemplates[array_rand($commentTemplates)];
                $body    = str_contains($tpl, '%s')
                    ? sprintf($tpl, $users->random()->name)
                    : (str_contains($tpl, '%d') ? sprintf($tpl, rand(100, 999)) : $tpl);
                $created = now()->subDays($daysAgo)->subHours(rand(0, 8));

                $commentId = DB::table('task_comments')->insertGetId([
                    'task_id'    => $task->id,
                    'user_id'    => $user->id,
                    'parent_id'  => ($i > 0 && rand(0, 1) && $parentId) ? $parentId : null,
                    'body'       => $body,
                    'is_edited'  => rand(0, 4) === 0,
                    'created_at' => $created,
                    'updated_at' => $created,
                ]);

                if ($i === 0) $parentId = $commentId;
                $daysAgo = max(0, $daysAgo - rand(0, 2));
                $commentCount++;
            }
        }

        $this->command->info("✓ Comments: {$commentCount}");

        // ── 3. Task Time Logs (completed and in-progress tasks) ───────────────
        DB::table('task_time_logs')->whereIn('task_id', $taskIds)->delete();

        $timeLogCount = 0;
        foreach ($tasks as $task) {
            if ($task->status === 'backlog') continue;

            $numSessions = match($task->status) {
                'completed'   => rand(2, 4),
                'in_progress' => rand(1, 3),
                'review'      => rand(1, 2),
                default       => rand(0, 1),
            };

            $assigneeIds = DB::table('task_assignments')
                ->where('task_id', $task->id)
                ->pluck('user_id')
                ->toArray();

            if (empty($assigneeIds)) $assigneeIds = [$admin->id];

            for ($s = 0; $s < $numSessions; $s++) {
                $userId      = $assigneeIds[array_rand($assigneeIds)];
                $daysAgo     = rand(1, 14);
                $startHour   = rand(8, 16);
                $durationMin = rand(25, min(90, $task->estimated_minutes ?? 60));
                $durationSec = $durationMin * 60;
                $startTime   = now()->subDays($daysAgo)->setTime($startHour, rand(0, 59));
                $endTime     = (clone $startTime)->addSeconds($durationSec);

                DB::table('task_time_logs')->insert([
                    'task_id'         => $task->id,
                    'user_id'         => $userId,
                    'start_time'      => $startTime,
                    'end_time'        => $endTime,
                    'paused_duration' => 0,
                    'duration'        => $durationSec,
                    'status'          => 'stopped',
                    'is_manual'       => rand(0, 4) === 0,
                    'created_at'      => $startTime,
                    'updated_at'      => $endTime,
                ]);
                $timeLogCount++;
            }

            // Update total_time_spent on task
            $totalSeconds = DB::table('task_time_logs')
                ->where('task_id', $task->id)
                ->where('status', 'stopped')
                ->sum('duration');
            DB::table('tasks')->where('id', $task->id)
                ->update(['total_time_spent' => $totalSeconds]);
        }

        $this->command->info("✓ Time logs: {$timeLogCount}");

        // ── 4. Task Watchers ──────────────────────────────────────────────────
        $watcherCount = 0;
        foreach ($tasks->random((int) ($tasks->count() * 0.5)) as $task) {
            $numWatchers = rand(1, 3);
            $picked = $users->random($numWatchers);
            foreach ($picked as $watcher) {
                DB::table('task_watchers')->insertOrIgnore([
                    'task_id'    => $task->id,
                    'user_id'    => $watcher->id,
                    'created_at' => now()->subDays(rand(0, 7)),
                    'updated_at' => now(),
                ]);
                $watcherCount++;
            }
        }

        $this->command->info("✓ Task watchers: {$watcherCount}");

        // ── 5. Task Dependencies ──────────────────────────────────────────────
        // Group tasks by project and create sensible chains
        $tasksByProject = $tasks->groupBy('project_id');
        $depCount       = 0;

        foreach ($tasksByProject as $projectTasks) {
            $ordered = $projectTasks->sortBy('position')->values();
            // Create 2-4 dependency chains per project
            $numDeps = min(rand(2, 4), $ordered->count() - 1);
            $usedPairs = [];

            for ($d = 0; $d < $numDeps; $d++) {
                // Pick two tasks where the "blocker" comes earlier in the list
                $attempts = 0;
                do {
                    $idxA = rand(0, max(0, $ordered->count() - 3));
                    $idxB = rand($idxA + 1, min($idxA + 4, $ordered->count() - 1));
                    $key  = $idxA . '-' . $idxB;
                    $attempts++;
                } while (isset($usedPairs[$key]) && $attempts < 10);

                if ($attempts >= 10) continue;
                $usedPairs[$key] = true;

                $blockingTask = $ordered[$idxA];
                $blockedTask  = $ordered[$idxB];

                // Skip if blocking task is already completed (no point blocking)
                if ($blockingTask->status === 'completed') continue;

                DB::table('task_dependencies')->insertOrIgnore([
                    'task_id'       => $blockedTask->id,
                    'depends_on_id' => $blockingTask->id,
                    'created_at'    => now()->subDays(rand(0, 5)),
                    'updated_at'    => now(),
                ]);
                $depCount++;
            }
        }

        $this->command->info("✓ Task dependencies: {$depCount}");

        // ── 6. Activity Logs ──────────────────────────────────────────────────
        DB::table('activity_logs')->truncate();
        $activityCount = 0;
        $taskModel     = Task::class;

        foreach ($tasks as $task) {
            $creator = $users->firstWhere('id', $task->created_by) ?? $admin;

            // Created event
            DB::table('activity_logs')->insert([
                'user_id'       => $creator->id,
                'subject_type'  => $taskModel,
                'subject_id'    => $task->id,
                'causer_type'   => User::class,
                'causer_id'     => $creator->id,
                'event'         => 'created',
                'properties'    => json_encode(['title' => $task->title]),
                'created_at'    => now()->subDays(rand(3, 14)),
            ]);
            $activityCount++;

            // Status changes for non-backlog tasks
            if ($task->status !== 'backlog') {
                $flow = match($task->status) {
                    'todo'        => [['backlog', 'todo']],
                    'in_progress' => [['backlog', 'todo'], ['todo', 'in_progress']],
                    'review'      => [['backlog', 'todo'], ['todo', 'in_progress'], ['in_progress', 'review']],
                    'completed'   => [['backlog', 'todo'], ['todo', 'in_progress'], ['in_progress', 'completed']],
                    default       => [],
                };

                $daysAgo = rand(2, 10);
                foreach ($flow as $transition) {
                    $mover = $users->random();
                    DB::table('activity_logs')->insert([
                        'user_id'      => $mover->id,
                        'subject_type' => $taskModel,
                        'subject_id'   => $task->id,
                        'causer_type'  => User::class,
                        'causer_id'    => $mover->id,
                        'event'        => 'status_changed',
                        'properties'   => json_encode(['from' => $transition[0], 'to' => $transition[1]]),
                        'created_at'   => now()->subDays($daysAgo),
                    ]);
                    $daysAgo = max(0, $daysAgo - rand(1, 3));
                    $activityCount++;
                }
            }

            // Assignment events
            $assignees = DB::table('task_assignments')->where('task_id', $task->id)->pluck('user_id');
            foreach ($assignees as $assigneeId) {
                $assignee = $users->firstWhere('id', $assigneeId);
                if (!$assignee) continue;
                DB::table('activity_logs')->insert([
                    'user_id'      => $admin->id,
                    'subject_type' => $taskModel,
                    'subject_id'   => $task->id,
                    'causer_type'  => User::class,
                    'causer_id'    => $admin->id,
                    'event'        => 'assigned',
                    'properties'   => json_encode(['assignee' => $assignee->name, 'assignee_id' => $assigneeId]),
                    'created_at'   => now()->subDays(rand(1, 8)),
                ]);
                $activityCount++;
            }

            // Comment events (for tasks that got comments)
            if (DB::table('task_comments')->where('task_id', $task->id)->exists()) {
                $commenter = $users->random();
                DB::table('activity_logs')->insert([
                    'user_id'      => $commenter->id,
                    'subject_type' => $taskModel,
                    'subject_id'   => $task->id,
                    'causer_type'  => User::class,
                    'causer_id'    => $commenter->id,
                    'event'        => 'commented',
                    'properties'   => json_encode([]),
                    'created_at'   => now()->subDays(rand(0, 3)),
                ]);
                $activityCount++;
            }
        }

        $this->command->info("✓ Activity logs: {$activityCount}");

        // ── 7. Notifications ──────────────────────────────────────────────────
        $notifTemplates = [
            'task_assigned' => [
                'type'    => 'App\\Notifications\\TaskAssigned',
                'message' => 'You have been assigned to "%s"',
            ],
            'task_comment' => [
                'type'    => 'App\\Notifications\\TaskCommented',
                'message' => '%s commented on "%s"',
            ],
            'task_due_soon' => [
                'type'    => 'App\\Notifications\\TaskDueSoon',
                'message' => 'Task "%s" is due tomorrow',
            ],
            'status_changed' => [
                'type'    => 'App\\Notifications\\TaskStatusChanged',
                'message' => '%s moved "%s" to %s',
            ],
            'milestone_due' => [
                'type'    => 'App\\Notifications\\MilestoneDueSoon',
                'message' => 'Milestone "%s" is due in 3 days',
            ],
            'mentioned' => [
                'type'    => 'App\\Notifications\\UserMentioned',
                'message' => '%s mentioned you in a comment on "%s"',
            ],
        ];

        $notifCount = 0;

        foreach ($users as $user) {
            $userTasks = $tasks->filter(function ($t) use ($user) {
                return DB::table('task_assignments')
                    ->where('task_id', $t->id)
                    ->where('user_id', $user->id)
                    ->exists();
            })->take(8);

            // task_assigned notifications
            foreach ($userTasks->take(4) as $task) {
                $actor   = $users->where('id', '!=', $user->id)->random();
                $isRead  = rand(0, 1);
                $created = now()->subDays(rand(0, 7))->subHours(rand(0, 12));
                DB::table('notifications')->insert([
                    'id'               => Str::uuid(),
                    'type'             => $notifTemplates['task_assigned']['type'],
                    'notifiable_type'  => User::class,
                    'notifiable_id'    => $user->id,
                    'data'             => json_encode([
                        'message'  => sprintf($notifTemplates['task_assigned']['message'], $task->title),
                        'task_id'  => $task->id,
                        'task'     => $task->title,
                        'actor'    => $actor->name,
                    ]),
                    'read_at'          => $isRead ? $created->addMinutes(rand(5, 60)) : null,
                    'created_at'       => $created,
                    'updated_at'       => $created,
                ]);
                $notifCount++;
            }

            // comment notifications
            foreach ($userTasks->take(3) as $task) {
                $commenter = $users->where('id', '!=', $user->id)->random();
                $isRead    = rand(0, 1);
                $created   = now()->subDays(rand(0, 4))->subHours(rand(0, 6));
                DB::table('notifications')->insert([
                    'id'              => Str::uuid(),
                    'type'            => $notifTemplates['task_comment']['type'],
                    'notifiable_type' => User::class,
                    'notifiable_id'   => $user->id,
                    'data'            => json_encode([
                        'message'    => sprintf($notifTemplates['task_comment']['message'], $commenter->name, $task->title),
                        'task_id'    => $task->id,
                        'task'       => $task->title,
                        'actor'      => $commenter->name,
                    ]),
                    'read_at'         => $isRead ? $created->addMinutes(rand(5, 30)) : null,
                    'created_at'      => $created,
                    'updated_at'      => $created,
                ]);
                $notifCount++;
            }

            // due soon notification
            $dueSoonTask = $userTasks->first();
            if ($dueSoonTask) {
                $created = now()->subHours(rand(1, 6));
                DB::table('notifications')->insert([
                    'id'              => Str::uuid(),
                    'type'            => $notifTemplates['task_due_soon']['type'],
                    'notifiable_type' => User::class,
                    'notifiable_id'   => $user->id,
                    'data'            => json_encode([
                        'message' => sprintf($notifTemplates['task_due_soon']['message'], $dueSoonTask->title),
                        'task_id' => $dueSoonTask->id,
                        'task'    => $dueSoonTask->title,
                    ]),
                    'read_at'         => null,
                    'created_at'      => $created,
                    'updated_at'      => $created,
                ]);
                $notifCount++;
            }

            // mention notification
            $mentionTask = $userTasks->skip(1)->first();
            if ($mentionTask) {
                $mentioner = $users->where('id', '!=', $user->id)->random();
                $created   = now()->subDays(rand(0, 2));
                DB::table('notifications')->insert([
                    'id'              => Str::uuid(),
                    'type'            => $notifTemplates['mentioned']['type'],
                    'notifiable_type' => User::class,
                    'notifiable_id'   => $user->id,
                    'data'            => json_encode([
                        'message' => sprintf($notifTemplates['mentioned']['message'], $mentioner->name, $mentionTask->title),
                        'task_id' => $mentionTask->id,
                        'task'    => $mentionTask->title,
                        'actor'   => $mentioner->name,
                    ]),
                    'read_at'         => rand(0, 1) ? now()->subHours(1) : null,
                    'created_at'      => $created,
                    'updated_at'      => $created,
                ]);
                $notifCount++;
            }
        }

        $this->command->info("✓ Notifications: {$notifCount}");

        // ── Summary ───────────────────────────────────────────────────────────
        $this->command->info('');
        $this->command->info('All dummy data seeded:');
        $this->command->info('  Tags:             ' . DB::table('tags')->count());
        $this->command->info('  Task-tag links:   ' . DB::table('task_tags')->count());
        $this->command->info('  Comments:         ' . DB::table('task_comments')->count());
        $this->command->info('  Time logs:        ' . DB::table('task_time_logs')->count());
        $this->command->info('  Watchers:         ' . DB::table('task_watchers')->count());
        $this->command->info('  Dependencies:     ' . DB::table('task_dependencies')->count());
        $this->command->info('  Activity logs:    ' . DB::table('activity_logs')->count());
        $this->command->info('  Notifications:    ' . DB::table('notifications')->count());
    }
}
