<?php

use App\Http\Controllers\API\AiController;
use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\AttachmentController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CommentController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\DependencyController;
use App\Http\Controllers\API\GoalController;
use App\Http\Controllers\API\MilestoneController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\ProjectController;
use App\Http\Controllers\API\ReportController;
use App\Http\Controllers\API\TaskController;
use App\Http\Controllers\API\TimerController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Vilva Taskspace — API Routes
|--------------------------------------------------------------------------
*/

// ─── Public Routes ────────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {

    // Auth
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);

    // ─── Authenticated Routes ──────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

        // Auth
        Route::post('/logout',          [AuthController::class, 'logout']);
        Route::get('/me',               [AuthController::class, 'me']);
        Route::patch('/me',             [AuthController::class, 'updateProfile']);
        Route::post('/me/avatar',       [AuthController::class, 'updateAvatar']);

        // ── AI ────────────────────────────────────────────────────────────
        Route::post('/ai/parse-task',   [AiController::class, 'parseTask']);

        // ── Admin ─────────────────────────────────────────────────────────
        Route::get('/admin/users',      [AdminController::class, 'users']);

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

        // ── Timer ─────────────────────────────────────────────────────────
        Route::get('/timer/active',                     [TimerController::class, 'active']);
        Route::post('/tasks/{task}/timer/start',        [TimerController::class, 'start']);
        Route::post('/tasks/{task}/timer/pause',        [TimerController::class, 'pause']);
        Route::post('/tasks/{task}/timer/resume',       [TimerController::class, 'resume']);
        Route::post('/tasks/{task}/timer/stop',         [TimerController::class, 'stop']);
        Route::post('/tasks/{task}/timer/manual',       [TimerController::class, 'addManual']);
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
        Route::get('/tasks/{task}/dependencies',        [DependencyController::class, 'index']);
        Route::post('/tasks/{task}/dependencies',       [DependencyController::class, 'store']);
        Route::delete('/tasks/{task}/dependencies/{dependsOnId}', [DependencyController::class, 'destroy']);

        // ── Notifications ─────────────────────────────────────────────────
        Route::get('/notifications',                    [NotificationController::class, 'index']);
        Route::get('/notifications/unread',             [NotificationController::class, 'unread']);
        Route::post('/notifications/{id}/read',         [NotificationController::class, 'markRead']);
        Route::post('/notifications/read-all',          [NotificationController::class, 'markAllRead']);

        // ── Reports ───────────────────────────────────────────────────────
        Route::get('/reports/user-productivity',        [ReportController::class, 'userProductivity']);
        Route::get('/reports/project-progress/{projectId}', [ReportController::class, 'projectProgress']);
        Route::get('/reports/time-tracking',            [ReportController::class, 'timeTracking']);
        Route::get('/reports/export-csv',               [ReportController::class, 'exportCsv']);
    });
});
