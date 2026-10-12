<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateProviderBookingStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'action' => [
                'required',
                'string',
                Rule::in([
                    'accept',
                    'reject',
                    'start',
                    'complete',
                ]),
            ],

            'note' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'action.required' =>
                'Select a booking action.',

            'action.in' =>
                'The booking action must be accept, reject, start, or complete.',

            'note.max' =>
                'The provider note must not exceed 2000 characters.',
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