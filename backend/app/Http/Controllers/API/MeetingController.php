<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeetingController extends Controller
{
    /**
     * GET /meetings — List meetings for the authenticated user (as organizer or attendee).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Meeting::with([
            'organizer:id,name,avatar',
            'attendees:id,name,avatar',
            'project:id,name,color',
        ])
            ->where(function ($q) use ($user) {
                $q->where('organizer_id', $user->id)
                  ->orWhereHas('attendees', fn ($sub) => $sub->where('users.id', $user->id));
            });

        if ($request->filled('from')) {
            $query->where('scheduled_start', '>=', $request->input('from'));
        }

        if ($request->filled('to')) {
            $query->where('scheduled_end', '<=', $request->input('to'));
        }

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->input('project_id'));
        }

        $meetings = $query->orderBy('scheduled_start')->get();

        return response()->json([
            'data' => $meetings->map(fn (Meeting $m) => $this->formatMeeting($m)),
        ]);
    }

    /**
     * POST /meetings — Create a new meeting.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'           => 'required|string|max:255',
            'scheduled_start' => 'required|date',
            'scheduled_end'   => 'required|date|after:scheduled_start',
            'location'        => 'nullable|string|max:255',
            'video_link'      => 'nullable|url|max:500',
            'description'     => 'nullable|string',
            'project_id'      => 'nullable|exists:projects,id',
            'attendee_ids'    => 'nullable|array',
            'attendee_ids.*'  => 'exists:users,id',
            'color'           => 'nullable|string|max:20',
            'notes'           => 'nullable|string',
        ]);

        $meeting = Meeting::create(array_merge(
            collect($validated)->except('attendee_ids')->toArray(),
            ['organizer_id' => $request->user()->id],
        ));

        if (!empty($validated['attendee_ids'])) {
            $attendees = collect($validated['attendee_ids'])
                ->mapWithKeys(fn ($id) => [$id => ['rsvp_status' => 'pending']]);
            $meeting->attendees()->attach($attendees);
        }

        $meeting->load(['organizer:id,name,avatar', 'attendees:id,name,avatar', 'project:id,name,color']);

        return response()->json(['data' => $this->formatMeeting($meeting)], 201);
    }

    /**
     * GET /meetings/{meeting} — Show a single meeting.
     */
    public function show(Meeting $meeting): JsonResponse
    {
        $meeting->load(['organizer:id,name,avatar', 'attendees:id,name,avatar', 'project:id,name,color']);

        return response()->json(['data' => $this->formatMeeting($meeting)]);
    }

    /**
     * PATCH /meetings/{meeting} — Update a meeting (organizer only).
     */
    public function update(Request $request, Meeting $meeting): JsonResponse
    {
        if ($meeting->organizer_id !== $request->user()->id) {
            return response()->json(['message' => 'Only the organizer can update this meeting.'], 403);
        }

        $validated = $request->validate([
            'title'           => 'sometimes|required|string|max:255',
            'scheduled_start' => 'sometimes|required|date',
            'scheduled_end'   => 'sometimes|required|date|after:scheduled_start',
            'location'        => 'nullable|string|max:255',
            'video_link'      => 'nullable|url|max:500',
            'description'     => 'nullable|string',
            'project_id'      => 'nullable|exists:projects,id',
            'attendee_ids'    => 'nullable|array',
            'attendee_ids.*'  => 'exists:users,id',
            'color'           => 'nullable|string|max:20',
            'notes'           => 'nullable|string',
            'status'          => 'sometimes|in:scheduled,in_progress,completed,cancelled',
        ]);

        $meeting->update(collect($validated)->except('attendee_ids')->toArray());

        if (array_key_exists('attendee_ids', $validated)) {
            $attendees = collect($validated['attendee_ids'] ?? [])
                ->mapWithKeys(fn ($id) => [$id => ['rsvp_status' => 'pending']]);
            $meeting->attendees()->sync($attendees);
        }

        $meeting->load(['organizer:id,name,avatar', 'attendees:id,name,avatar', 'project:id,name,color']);

        return response()->json(['data' => $this->formatMeeting($meeting)]);
    }

    /**
     * DELETE /meetings/{meeting} — Soft delete a meeting (organizer or admin).
     */
    public function destroy(Request $request, Meeting $meeting): JsonResponse
    {
        $user = $request->user();

        $isAdmin = method_exists($user, 'isAdmin') && $user->isAdmin();

        if ($meeting->organizer_id !== $user->id && !$isAdmin) {
            return response()->json(['message' => 'Only the organizer or an admin can delete this meeting.'], 403);
        }

        $meeting->delete();

        return response()->json(['message' => 'Meeting deleted.']);
    }

    /**
     * POST /meetings/{meeting}/rsvp — RSVP to a meeting.
     */
    public function rsvp(Request $request, Meeting $meeting): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:accepted,declined,tentative',
        ]);

        $user = $request->user();

        // Ensure user is an attendee
        if (!$meeting->attendees()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'You are not an attendee of this meeting.'], 403);
        }

        $meeting->attendees()->updateExistingPivot($user->id, [
            'rsvp_status'  => $validated['status'],
            'responded_at' => now(),
        ]);

        return response()->json(['message' => 'RSVP updated.']);
    }

    /**
     * PATCH /meetings/{meeting}/notes — Update meeting notes/minutes.
     */
    public function updateNotes(Request $request, Meeting $meeting): JsonResponse
    {
        $validated = $request->validate([
            'notes' => 'required|string',
        ]);

        $meeting->update(['notes' => $validated['notes']]);

        return response()->json(['message' => 'Meeting notes updated.']);
    }

    /**
     * Format a meeting for JSON response.
     */
    private function formatMeeting(Meeting $meeting): array
    {
        return [
            'id'               => $meeting->id,
            'title'            => $meeting->title,
            'description'      => $meeting->description,
            'scheduled_start'  => $meeting->scheduled_start?->toIso8601String(),
            'scheduled_end'    => $meeting->scheduled_end?->toIso8601String(),
            'location'         => $meeting->location,
            'video_link'       => $meeting->video_link,
            'notes'            => $meeting->notes,
            'status'           => $meeting->status,
            'color'            => $meeting->color,
            'duration_minutes' => $meeting->duration_minutes,
            'organizer'        => $meeting->organizer ? [
                'id'         => $meeting->organizer->id,
                'name'       => $meeting->organizer->name,
                'avatar_url' => $meeting->organizer->avatar_url ?? null,
            ] : null,
            'project'          => $meeting->project ? [
                'id'    => $meeting->project->id,
                'name'  => $meeting->project->name,
                'color' => $meeting->project->color ?? null,
            ] : null,
            'attendees'        => $meeting->attendees->map(fn ($a) => [
                'id'          => $a->id,
                'name'        => $a->name,
                'avatar_url'  => $a->avatar_url ?? null,
                'rsvp_status' => $a->pivot->rsvp_status,
            ])->values()->toArray(),
        ];
    }
}
