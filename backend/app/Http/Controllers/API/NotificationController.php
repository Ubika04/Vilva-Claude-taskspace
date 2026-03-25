<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\NotificationPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NotificationController extends Controller
{
    /**
     * All supported notification event types.
     */
    private const EVENT_TYPES = [
        'task_assigned', 'task_status_changed', 'task_completed',
        'task_overdue', 'task_comment', 'task_mention',
        'project_member_added', 'project_member_removed',
        'chat_message', 'chat_mention',
        'review_requested', 'review_approved', 'review_rejected',
        'dependency_resolved', 'schedule_conflict',
        'work_session_reminder',
    ];

    /**
     * GET /notifications — All notifications (paginated)
     */
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->notifications()->latest();

        // Filter by type
        if ($type = $request->input('type')) {
            $query->where('data->type', $type);
        }

        $notifications = $query->paginate($request->integer('per_page', 20));

        return response()->json($notifications);
    }

    /**
     * GET /notifications/unread — Unread notifications with count
     */
    public function unread(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->unreadNotifications()
            ->latest()
            ->limit(50)
            ->get();

        return response()->json([
            'data'  => $notifications,
            'count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    /**
     * POST /notifications/{id}/read — Mark single as read
     */
    public function markRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json(['message' => 'Marked as read.']);
    }

    /**
     * POST /notifications/read-all — Mark all as read
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'All notifications marked as read.']);
    }

    /**
     * DELETE /notifications/{id} — Delete a notification
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $request->user()->notifications()->where('id', $id)->delete();

        return response()->json(null, 204);
    }

    /**
     * DELETE /notifications/clear — Clear all read notifications
     */
    public function clearRead(Request $request): JsonResponse
    {
        $request->user()->readNotifications()->delete();

        return response()->json(['message' => 'Cleared read notifications.']);
    }

    /**
     * GET /notifications/preferences — Get user's notification preferences
     */
    public function preferences(Request $request): JsonResponse
    {
        $prefs = NotificationPreference::where('user_id', $request->user()->id)->get();

        // Build full grid with defaults
        $result = [];
        foreach (self::EVENT_TYPES as $eventType) {
            $inApp = $prefs->first(fn ($p) => $p->event_type === $eventType && $p->channel === 'in_app');
            $email = $prefs->first(fn ($p) => $p->event_type === $eventType && $p->channel === 'email');

            $result[] = [
                'event_type' => $eventType,
                'label'      => str_replace('_', ' ', ucfirst($eventType)),
                'in_app'     => $inApp ? $inApp->enabled : true,
                'email'      => $email ? $email->enabled : false,
            ];
        }

        return response()->json($result);
    }

    /**
     * PUT /notifications/preferences — Update notification preferences
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'preferences'              => 'required|array',
            'preferences.*.event_type' => 'required|string|in:' . implode(',', self::EVENT_TYPES),
            'preferences.*.channel'    => 'required|string|in:in_app,email,push',
            'preferences.*.enabled'    => 'required|boolean',
        ]);

        foreach ($validated['preferences'] as $pref) {
            NotificationPreference::updateOrCreate(
                [
                    'user_id'    => $request->user()->id,
                    'event_type' => $pref['event_type'],
                    'channel'    => $pref['channel'],
                ],
                ['enabled' => $pref['enabled']],
            );
        }

        return response()->json(['message' => 'Preferences updated.']);
    }

    /**
     * POST /notifications/send — Admin: send a notification to users
     */
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_ids'  => 'required|array',
            'user_ids.*'=> 'integer|exists:users,id',
            'title'     => 'required|string|max:255',
            'message'   => 'required|string|max:1000',
            'type'      => 'sometimes|string',
            'action_url'=> 'sometimes|nullable|string',
        ]);

        foreach ($validated['user_ids'] as $userId) {
            DB::table('notifications')->insert([
                'id'              => Str::uuid(),
                'type'            => 'App\\Notifications\\CustomNotification',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id'   => $userId,
                'data'            => json_encode([
                    'type'       => $validated['type'] ?? 'custom',
                    'title'      => $validated['title'],
                    'message'    => $validated['message'],
                    'action_url' => $validated['action_url'] ?? null,
                    'sender_id'  => $request->user()->id,
                    'sender_name'=> $request->user()->name,
                ]),
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);
        }

        return response()->json(['message' => 'Notifications sent.', 'count' => count($validated['user_ids'])]);
    }

    /**
     * GET /notifications/summary — Notification counts grouped by type
     */
    public function summary(Request $request): JsonResponse
    {
        $counts = $request->user()
            ->unreadNotifications()
            ->get()
            ->groupBy(fn ($n) => $n->data['type'] ?? 'other')
            ->map->count();

        return response()->json([
            'total_unread' => $counts->sum(),
            'by_type'      => $counts,
        ]);
    }
}
