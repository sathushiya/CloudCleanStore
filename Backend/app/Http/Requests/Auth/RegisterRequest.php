<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',              // requires password_confirmation field
                'regex:/[A-Z]/',          // must have uppercase
                'regex:/[a-z]/',          // must have lowercase
                'regex:/[0-9]/',          // must have number
                'regex:/[!@#$%^&*(),.?":{}|<>]/', // must have special char
            ],
            // Required now that account verification is WhatsApp-only -- there's
            // no other channel to reach the customer through. Format itself
            // (country code, digit count) is checked by PhoneService in the
            // controller, which also tolerates spaces/dashes the way the
            // frontend's own client-side check does.
            'phone_number' => ['required', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Full name is required',
            'email.required' => 'Email address is required',
            'email.email' => 'Please enter a valid email address',
            'email.unique' => 'This email is already registered',
            'password.required' => 'Password is required',
            'password.min' => 'Password must be at least 8 characters',
            'password.confirmed' => 'Passwords do not match',
            'password.regex' => 'Password must include uppercase, lowercase, number, and special character',
            'phone_number.required' => 'Phone number is required for WhatsApp verification',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors(),
        ], 422));
    }
}