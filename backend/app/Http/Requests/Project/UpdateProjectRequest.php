<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'        => 'sometimes|string|min:2|max:255',
            'description' => 'nullable|string|max:5000',
            'color'       => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'icon'        => 'nullable|string|max:50',
            'status'      => 'sometimes|string|in:active,archived,completed,on_hold',
            'visibility'  => 'sometimes|string|in:private,team,public',
            'start_date'  => 'nullable|date',
            'due_date'    => 'nullable|date',
            'ai_enabled'  => 'nullable|boolean',
            'ai_context'  => 'nullable|string|max:2000',
        ];
    }
}
