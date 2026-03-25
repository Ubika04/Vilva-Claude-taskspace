<?php

use App\Http\Controllers\API\AiController;
use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\AttachmentController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ChatController;
use App\Http\Controllers\API\CommentController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\DependencyController;
use App\Http\Controllers\API\GoalController;
use App\Http\Controllers\API\MilestoneController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\ProjectController;
use App\Http\Controllers\API\ReportController;
use App\Http\Controllers\API\MeetingController;
use App\Http\Controllers\API\ScheduleController;
use App\Http\Controllers\API\SearchController;
use App\Http\Controllers\API\TagController;
use App\Http\Controllers\API\TaskController;
use App\Http\Controllers\API\TimeboxController;
use App\Http\Controllers\API\TimerController;
use App\Http\Controllers\API\WorkSessionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Vilva Taskspace — API Routes
|--------------------------------------------------------------------------
*/

// ─── Public Routes ────────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {

    // Auth
    Route::post('/register',        [AuthController::class, 'register']);
    Route::post('/login',           [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password',  [AuthController::class, 'resetPassword']);

    // ─── Authenticated Routes ──────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

        // Auth
        Route::post('/logout',          [AuthController::class, 'logout']);
        Route::get('/me',               [AuthController::class, 'me']);
        Route::patch('/me',             [AuthController::class, 'updateProfile']);
        Route::post('/me/avatar',       [AuthController::class, 'updateAvatar']);

        // ── AI ────────────────────────────────────────────────────────────
        Route::post('/ai/parse-task',                              [AiController::class, 'parseTask']);
        Route::post('/projects/{project}/ai/generate-tasks',       [AiController::class, 'generateProjectTasks']);

        // ── Admin ─────────────────────────────────────────────────────────
        Route::get('/admin/users',              [AdminController::class, 'users']);
        Route::get('/admin/roles',              [AdminController::class, 'roles']);
        Route::post('/admin/users',             [AdminController::class, 'createUser']);
        Route::patch('/admin/users/{user}',     [AdminController::class, 'updateUser']);
        Route::delete('/admin/users/{user}',    [AdminController::class, 'deleteUser']);
        Route::post('/admin/users/{user}/reset-password', [AdminController::class, 'resetPassword']);
        Route::post('/admin/roles',             [AdminController::class, 'createRole']);
        Route::patch('/admin/roles/{role}',     [AdminController::class, 'updateRole']);
        Route::delete('/admin/roles/{role}',    [AdminController::class, 'deleteRole']);
        Route::get('/admin/permissions',        [AdminController::class, 'permissions']);

        // ── Goals ─────────────────────────────────────────────────────────
        Route::get('/goals',            [GoalController::class, 'index']);
        Route::post('/goals',           [GoalController::class, 'store']);
        Route::patch('/goals/{goal}',   [GoalController::class, 'update']);
        Route::delete('/goals/{goal}',  [GoalController::class, 'destroy']);

        // ── Milestones ────────────────────────────────────────────────────
        Route::get('/projects/{project}/milestones',              [MilestoneController::class, 'index']);
        Route::post('/projects/{project}/milestones',             [MilestoneController::class, 'store']);
        Route::patch('/projects/{project}/milestones/{milestone}',[MilestoneController::class, 'update']);
        Route::delete('/projects/{project}/milestones/{milestone}',[MilestoneController::class, 'destroy']);

        // Search
        Route::get('/search',           [SearchController::class, 'search']);

        // Tags
        Route::get('/tags',             [TagController::class, 'index']);
        Route::post('/tags',            [TagController::class, 'store']);

        // User search (for pickers)
        Route::get('/users/search',     [AdminController::class, 'searchUsers']);

        // Dashboard
        Route::get('/dashboard',        [DashboardController::class, 'index']);

        // ── Projects ──────────────────────────────────────────────────────
        Route::apiResource('projects', ProjectController::class);
        Route::get('/projects/{project}/stats',              [ProjectController::class, 'stats']);
        Route::post('/projects/{project}/members',           [ProjectController::class, 'addMember']);
        Route::delete('/projects/{project}/members/{user}',  [ProjectController::class, 'removeMember']);

        // ── Tasks ─────────────────────────────────────────────────────────
        Route::get('/my-tasks',   [TaskController::class, 'myTasks']);
        Route::get('/overdue',    [TaskController::class, 'overdue']);

        Route::get('/projects/{project}/tasks',         [TaskController::class, 'index']);
        Route::post('/projects/{project}/tasks',        [TaskController::class, 'store']);
        Route::get('/projects/{project}/kanban',        [TaskController::class, 'kanban']);
        Route::post('/projects/{project}/tasks/reorder',[TaskController::class, 'reorder']);

        Route::get('/tasks/{task}',                     [TaskController::class, 'show']);
        Route::put('/tasks/{task}',                     [TaskController::class, 'update']);
        Route::patch('/tasks/{task}',                   [TaskController::class, 'update']);
        Route::delete('/tasks/{task}',                  [TaskController::class, 'destroy']);
        Route::post('/tasks/{task}/move',               [TaskController::class, 'move']);
        Route::get('/tasks/{task}/activity',            [TaskController::class, 'activity']);

        // ── Reviewers ───────────────────────────────────────────────────
        Route::post('/tasks/{task}/reviewers',           [TaskController::class, 'addReviewers']);
        Route::delete('/tasks/{task}/reviewers/{user}',  [TaskController::class, 'removeReviewer']);
        Route::post('/tasks/{task}/review',              [TaskController::class, 'submitReview']);

        // ── Timer ─────────────────────────────────────────────────────────
        Route::get('/timer/active',                     [TimerController::class, 'active']);
        Route::post('/tasks/{task}/timer/start',        [TimerController::class, 'start']);
        Route::post('/tasks/{task}/timer/pause',        [TimerController::class, 'pause']);
        Route::post('/tasks/{task}/timer/resume',       [TimerController::class, 'resume']);
        Route::post('/tasks/{task}/timer/stop',         [TimerController::class, 'stop']);
        Route::get('/tasks/{task}/timer/logs',          [TimerController::class, 'logs']);

        // ── Comments ──────────────────────────────────────────────────────
        Route::get('/tasks/{task}/comments',            [CommentController::class, 'index']);
        Route::post('/tasks/{task}/comments',           [CommentController::class, 'store']);
        Route::put('/comments/{comment}',               [CommentController::class, 'update']);
        Route::delete('/comments/{comment}',            [CommentController::class, 'destroy']);

        // ── Attachments ───────────────────────────────────────────────────
        Route::post('/tasks/{task}/attachments',        [AttachmentController::class, 'store']);
        Route::get('/attachments/{attachment}/download',[AttachmentController::class, 'download']);
        Route::delete('/attachments/{attachment}',      [AttachmentController::class, 'destroy']);

        // ── Dependencies ──────────────────────────────────────────────────
        Route::get('/dependencies/all',                  [DependencyController::class, 'all']);
        Route::get('/tasks/{task}/dependencies',        [DependencyController::class, 'index']);
        Route::post('/tasks/{task}/dependencies',       [DependencyController::class, 'store']);
        Route::delete('/tasks/{task}/dependencies/{dependsOnId}', [DependencyController::class, 'destroy']);

        // ── Notifications ─────────────────────────────────────────────────
        Route::get('/notifications',                    [NotificationController::class, 'index']);
        Route::get('/notifications/unread',             [NotificationController::class, 'unread']);
        Route::get('/notifications/summary',            [NotificationController::class, 'summary']);
        Route::get('/notifications/preferences',        [NotificationController::class, 'preferences']);
        Route::put('/notifications/preferences',        [NotificationController::class, 'updatePreferences']);
        Route::post('/notifications/{id}/read',         [NotificationController::class, 'markRead']);
        Route::post('/notifications/read-all',          [NotificationController::class, 'markAllRead']);
        Route::post('/notifications/send',              [NotificationController::class, 'send']);
        Route::delete('/notifications/clear',           [NotificationController::class, 'clearRead']);
        Route::delete('/notifications/{id}',            [NotificationController::class, 'destroy']);

        // ── Timebox ──────────────────────────────────────────────────────
        Route::get('/timebox/presets',                   [TimeboxController::class, 'presets']);
        Route::post('/timebox/presets',                  [TimeboxController::class, 'storePreset']);
        Route::patch('/timebox/presets/{preset}',        [TimeboxController::class, 'updatePreset']);
        Route::delete('/timebox/presets/{preset}',       [TimeboxController::class, 'destroyPreset']);
        Route::post('/timebox/validate',                 [TimeboxController::class, 'validateTimebox']);
        Route::get('/timebox/schedule',                  [TimeboxController::class, 'schedule']);

        // ── Reports ───────────────────────────────────────────────────────
        Route::get('/reports/user-productivity',        [ReportController::class, 'userProductivity']);
        Route::get('/reports/project-progress/{projectId}', [ReportController::class, 'projectProgress']);
        Route::get('/reports/time-tracking',            [ReportController::class, 'timeTracking']);
        Route::get('/reports/export-csv',               [ReportController::class, 'exportCsv']);
        Route::get('/reports/velocity',                 [ReportController::class, 'velocity']);

        // ── Chat ─────────────────────────────────────────────────────────
        Route::get('/chat/channels',                          [ChatController::class, 'channels']);
        Route::get('/chat/channels/{channel}',                [ChatController::class, 'show']);
        Route::get('/chat/channels/{channel}/messages',       [ChatController::class, 'messages']);
        Route::post('/chat/channels/{channel}/messages',      [ChatController::class, 'sendMessage']);
        Route::put('/chat/messages/{message}',                [ChatController::class, 'editMessage']);
        Route::delete('/chat/messages/{message}',             [ChatController::class, 'deleteMessage']);
        Route::post('/chat/messages/{message}/react',         [ChatController::class, 'react']);
        Route::post('/chat/messages/{message}/pin',           [ChatController::class, 'pin']);
        Route::post('/chat/channels/{channel}/mute',          [ChatController::class, 'toggleMute']);
        Route::post('/chat/channels/{channel}/read',          [ChatController::class, 'markRead']);
        Route::post('/chat/channels/{channel}/members',          [ChatController::class, 'addMembers']);
        Route::delete('/chat/channels/{channel}/members/{user}', [ChatController::class, 'removeMember']);

        // ── Work Sessions (Employee Time Tracking) ───────────────────────
        Route::post('/work-sessions/clock-in',                [WorkSessionController::class, 'clockIn']);
        Route::post('/work-sessions/clock-out',               [WorkSessionController::class, 'clockOut']);
        Route::post('/work-sessions/break/start',             [WorkSessionController::class, 'startBreak']);
        Route::post('/work-sessions/break/end',               [WorkSessionController::class, 'endBreak']);
        Route::get('/work-sessions/active',                   [WorkSessionController::class, 'active']);
        Route::get('/work-sessions/history',                  [WorkSessionController::class, 'history']);
        Route::get('/work-sessions/summary',                  [WorkSessionController::class, 'summary']);
        Route::get('/work-sessions/team',                     [WorkSessionController::class, 'team']);

        // ── Schedule (Task Overlap Prevention) ───────────────────────────
        Route::post('/tasks/{task}/schedule',                 [ScheduleController::class, 'scheduleTask']);
        Route::delete('/tasks/{task}/schedule',               [ScheduleController::class, 'removeSchedule']);
        Route::post('/schedule/validate',                     [ScheduleController::class, 'validate']);
        Route::get('/schedule/my',                            [ScheduleController::class, 'mySchedule']);
        Route::get('/schedule/available-slots',               [ScheduleController::class, 'availableSlots']);

        // ── Meetings ────────────────────────────────────────────────────
        Route::get('/meetings',                          [MeetingController::class, 'index']);
        Route::post('/meetings',                         [MeetingController::class, 'store']);
        Route::get('/meetings/{meeting}',                [MeetingController::class, 'show']);
        Route::patch('/meetings/{meeting}',              [MeetingController::class, 'update']);
        Route::delete('/meetings/{meeting}',             [MeetingController::class, 'destroy']);
        Route::post('/meetings/{meeting}/rsvp',          [MeetingController::class, 'rsvp']);
        Route::patch('/meetings/{meeting}/notes',        [MeetingController::class, 'updateNotes']);
    });
});
