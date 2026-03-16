<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'project_id'         => $this->project_id,
            'parent_id'          => $this->parent_id,
            'title'              => $this->title,
            'description'        => $this->description,
            'status'             => $this->status,
            'priority'           => $this->priority,
            'due_date'           => $this->due_date?->toDateString(),
            'start_date'         => $this->start_date?->toDateString(),
            'position'           => $this->position,
            'estimated_minutes'  => $this->estimated_minutes,
            'total_time_spent'   => $this->total_time_spent,
            'is_archived'        => $this->is_archived,
            'completed_at'       => $this->completed_at?->toIso8601String(),
            'is_blocked'         => $this->whenLoaded('blockedBy', fn() => $this->isBlocked(), null),
            'project'            => new ProjectResource($this->whenLoaded('project')),
            'creator'            => new UserResource($this->whenLoaded('creator')),
            'assignees'          => UserResource::collection($this->whenLoaded('assignees')),
            'watchers'           => UserResource::collection($this->whenLoaded('watchers')),
            'reviewers'          => UserResource::collection($this->whenLoaded('reviewers')),
            'tags'               => $this->whenLoaded('tags'),
            'subtasks'           => TaskResource::collection($this->whenLoaded('subtasks')),
            'subtasks_count'     => $this->subtasks_count ?? null,
            'comments'           => $this->whenLoaded('comments'),
            'attachments'        => $this->whenLoaded('attachments'),
            'blocked_by'         => $this->whenLoaded('blockedBy'),
            'blocking'           => $this->whenLoaded('blocking'),
            'active_timer'       => $this->whenLoaded('timeLogs', fn() => $this->timeLogs->first()),
            'created_at'         => $this->created_at->toIso8601String(),
            'updated_at'         => $this->updated_at->toIso8601String(),
        ];
    }
}
