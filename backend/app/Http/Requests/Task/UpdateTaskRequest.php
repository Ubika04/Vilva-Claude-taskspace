<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'             => 'sometimes|string|min:2|max:500',
            'description'       => 'nullable|string',
            'status'            => 'sometimes|string|in:backlog,todo,in_progress,review,completed',
            'priority'          => 'sometimes|string|in:low,medium,high,urgent',
            'due_date'          => 'nullable|date',
            'start_date'        => 'nullable|date',
            'assignees'         => 'nullable|array',
            'assignees.*'       => 'integer|exists:users,id',
            'tags'              => 'nullable|array',
            'tags.*'            => 'integer|exists:tags,id',
            'estimated_minutes' => 'nullable|integer|min:1',
        ];
    }
}
