<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('staff')?->id;
        $isCreate = $this->isMethod('post');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,' . $userId],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'role' => ['required', 'in:admin,staff,staffsupervisor'],
            'is_active' => ['sometimes', 'boolean'],
            'password' => [$isCreate ? 'required' : 'nullable', 'string', 'min:8'],
        ];
    }
}