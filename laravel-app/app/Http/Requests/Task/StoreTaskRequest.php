<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'             => 'required|string|min:2|max:500',
            'description'       => 'nullable|string',
            'status'            => 'nullable|string|in:backlog,todo,in_progress,review,completed',
            'priority'          => 'nullable|string|in:low,medium,high,urgent',
            'due_date'          => 'nullable|date',
            'start_date'        => 'nullable|date',
            'parent_id'         => 'nullable|integer|exists:tasks,id',
            // Accept both 'assignees' and 'assignee_ids'
            'assignees'         => 'nullable|array',
            'assignees.*'       => 'integer|exists:users,id',
            'assignee_ids'      => 'nullable|array',
            'assignee_ids.*'    => 'integer|exists:users,id',
            // Accept both 'tags' and 'tag_ids'
            'tags'              => 'nullable|array',
            'tags.*'            => 'integer|exists:tags,id',
            'tag_ids'           => 'nullable|array',
            'tag_ids.*'         => 'integer|exists:tags,id',
            // Accept both 'watcher_ids' and 'watchers'
            'watcher_ids'       => 'nullable|array',
            'watcher_ids.*'     => 'integer|exists:users,id',
            'estimated_minutes' => 'nullable|integer|min:1',
            'estimated_time'    => 'nullable|integer|min:1',
        ];
    }

    /**
     * Normalise assignee_ids / tag_ids into the field names the service expects.
     */
    protected function prepareForValidation(): void
    {
        // Normalise empty strings to null for nullable fields (API routes skip ConvertEmptyStringsToNull)
        $merge = [];
        foreach (['due_date', 'start_date', 'estimated_minutes', 'estimated_time', 'description', 'parent_id'] as $field) {
            if ($this->has($field) && $this->input($field) === '') {
                $merge[$field] = null;
            }
        }

        if ($this->has('assignee_ids') && ! $this->has('assignees')) {
            $merge['assignees'] = $this->assignee_ids;
        }
        if ($this->has('tag_ids') && ! $this->has('tags')) {
            $merge['tags'] = $this->tag_ids;
        }
        // Convert estimated_time (seconds) back to minutes for the service
        if ($this->has('estimated_time') && ! $this->has('estimated_minutes')) {
            $merge['estimated_minutes'] = (int) ceil($this->estimated_time / 60);
        }

        if (!empty($merge)) {
            $this->merge($merge);
        }
    }
}
