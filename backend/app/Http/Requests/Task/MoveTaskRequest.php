<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;

class MoveTaskRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'status'   => 'required|string|in:backlog,todo,in_progress,working_on,review,blocked,completed',
            'position' => 'nullable|integer|min:0',
        ];
    }
}
