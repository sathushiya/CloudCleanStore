<?php

namespace App\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'brand_id' => ['required', 'exists:brands,id'],
            'name' => ['required', 'string', 'max:150'],
            'category' => ['required', 'in:bathroom,floor,kitchen,glass,laundry,industrial'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string'],
            'badge' => ['nullable', 'string', 'max:50'],
            'is_active' => ['sometimes', 'boolean'],
            'variants' => ['required', 'array', 'min:1'],
            'variants.*.size' => ['required', 'string', 'max:30'],
            'variants.*.price' => ['required', 'numeric', 'min:0'],
            'variants.*.shop_stock' => ['sometimes', 'integer', 'min:0'],
            'variants.*.online_stock' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
