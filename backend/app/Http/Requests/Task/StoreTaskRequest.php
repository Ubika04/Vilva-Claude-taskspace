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
            'assignees'         => 'nullable|array',
            'assignees.*'       => 'integer|exists:users,id',
            'tags'              => 'nullable|array',
            'tags.*'            => 'integer|exists:tags,id',
            'estimated_minutes' => 'nullable|integer|min:1',
        ];
    }
}
