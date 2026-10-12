<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreProviderComplaintResponseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'response_text' => [
                'required',
                'string',
                'min:10',
                'max:5000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'response_text.required' =>
                'Enter a response to the complaint.',

            'response_text.min' =>
                'The complaint response must contain at least 10 characters.',

            'response_text.max' =>
                'The complaint response must not exceed 5000 characters.',
        ];
    }

    protected function failedValidation(
        Validator $validator
    ): void {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' =>
                    'Please correct the highlighted fields.',
                'data' => null,
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}