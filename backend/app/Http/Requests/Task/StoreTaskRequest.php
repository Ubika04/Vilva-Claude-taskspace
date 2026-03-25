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
            'status'            => 'nullable|string|in:backlog,todo,in_progress,working_on,review,blocked,completed',
            'priority'          => 'nullable|string|in:low,medium,high,urgent',
            'task_type'         => 'required|string|in:task,feature,bug,improvement,story,spike,chore',
            'due_date'          => 'nullable|date',
            'start_date'        => 'nullable|date',
            'timebox_start'     => 'nullable|date_format:Y-m-d\TH:i',
            'timebox_end'       => 'nullable|date_format:Y-m-d\TH:i',
            'parent_id'         => 'nullable|integer|exists:tasks,id',
            'assignees'         => 'nullable|array',
            'assignees.*'       => 'integer|exists:users,id',
            'assignee_ids'      => 'nullable|array',
            'assignee_ids.*'    => 'integer|exists:users,id',
            'watcher_ids'       => 'nullable|array',
            'watcher_ids.*'     => 'integer|exists:users,id',
            'tags'              => 'nullable|array',
            'tags.*'            => 'integer|exists:tags,id',
            'tag_ids'           => 'nullable|array',
            'tag_ids.*'         => 'integer|exists:tags,id',
            'reviewer_ids'      => 'nullable|array',
            'reviewer_ids.*'    => 'integer|exists:users,id',
            'estimated_minutes' => 'nullable|integer|min:1',
            'score'             => 'nullable|integer|min:1|max:100',
        ];
    }
}
