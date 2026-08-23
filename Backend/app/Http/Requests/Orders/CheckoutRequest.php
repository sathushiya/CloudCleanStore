<?php

namespace App\Http\Requests\Orders;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'delivery_address' => ['required', 'string', 'max:500'],
            // Optional (defaults to cash in the controller), but a bad
            // value should fail here with a clean message rather than hit
            // the database's enum constraint and surface as a raw 500.
            'payment_method' => ['sometimes', 'string', 'in:cash,bank_transfer'],
        ];
    }
}
