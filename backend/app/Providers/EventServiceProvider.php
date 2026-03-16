<?php

namespace App\Providers;

use App\Events\ProjectCreated;
use App\Events\TaskAssigned;
use App\Events\TaskStatusChanged;
use App\Events\UserMentioned;
use App\Listeners\SendMentionNotification;
use App\Listeners\SendTaskAssignedNotification;
use App\Listeners\SendTaskStatusChangedNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        TaskAssigned::class => [
            SendTaskAssignedNotification::class,
        ],
        TaskStatusChanged::class => [
            SendTaskStatusChangedNotification::class,
        ],
        UserMentioned::class => [
            SendMentionNotification::class,
        ],
    ];

    public function boot(): void {}
}
