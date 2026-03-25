<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'        => 'required|string|min:2|max:255',
            'description' => 'nullable|string|max:5000',
            'color'       => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'icon'        => 'nullable|string|max:50',
            'visibility'  => 'nullable|string|in:private,team,public',
            'start_date'  => 'nullable|date',
            'due_date'    => 'nullable|date|after_or_equal:start_date',
            'ai_enabled'  => 'nullable|boolean',
            'ai_context'  => 'nullable|string|max:2000',
            'member_ids'   => 'nullable|array',
            'member_ids.*' => 'integer|exists:users,id',
        ];
    }
}
