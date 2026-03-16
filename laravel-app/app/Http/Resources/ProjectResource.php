<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'description' => $this->description,
            'slug'        => $this->slug,
            'color'       => $this->color,
            'icon'        => $this->icon,
            'status'      => $this->status,
            'visibility'  => $this->visibility,
            'start_date'  => $this->start_date?->toDateString(),
            'due_date'    => $this->due_date?->toDateString(),
            'progress'    => $this->progress,
            'owner'       => new UserResource($this->whenLoaded('owner')),
            'members'     => UserResource::collection($this->whenLoaded('members')),
            'tags'        => $this->whenLoaded('tags'),
            'tasks_count' => $this->tasks_count ?? null,
            'created_at'  => $this->created_at?->toIso8601String(),
            'updated_at'  => $this->updated_at?->toIso8601String(),
        ];
    }
}
