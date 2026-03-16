<?php

namespace App\Console;

use App\Jobs\SendDeadlineReminders;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // Send deadline reminders every hour
        $schedule->job(new SendDeadlineReminders)->hourly();

        // Recalculate project progress nightly
        $schedule->command('projects:recalculate-progress')->dailyAt('00:00');

        // Prune old activity logs (keep 90 days)
        $schedule->command('model:prune', ['--model' => \App\Models\ActivityLog::class])->daily();

        // Clear stale cache
        $schedule->command('cache:prune-stale-tags')->hourly();
    }

    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');
        require base_path('routes/console.php');
    }
}
