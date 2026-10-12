<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreProviderOfferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'proposed_price' => [
                'required',
                'numeric',
                'min:0',
                'max:9999999999.99',
            ],
            'proposed_date' => [
                'required',
                'date',
                'after_or_equal:today',
            ],
            'proposed_time' => [
                'required',
                'date_format:H:i',
            ],
            'duration_minutes' => [
                'required',
                'integer',
                'min:15',
                'max:10080',
            ],
            'message' => [
                'nullable',
                'string',
                'max:3000',
            ],
            'terms' => [
                'nullable',
                'string',
                'max:3000',
            ],
            'expires_on' => [
                'nullable',
                'date',
                'after_or_equal:today',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'proposed_price.required' =>
                'Enter the proposed price.',

            'proposed_price.numeric' =>
                'The proposed price must be a number.',

            'proposed_price.min' =>
                'The proposed price cannot be negative.',

            'proposed_date.required' =>
                'Select the proposed service date.',

            'proposed_date.after_or_equal' =>
                'The proposed service date cannot be in the past.',

            'proposed_time.required' =>
                'Select the proposed service time.',

            'proposed_time.date_format' =>
                'Enter a valid proposed service time.',

            'duration_minutes.required' =>
                'Enter the estimated duration.',

            'duration_minutes.integer' =>
                'The estimated duration must be entered in minutes.',

            'duration_minutes.min' =>
                'The estimated duration must be at least 15 minutes.',

            'duration_minutes.max' =>
                'The estimated duration is too long.',

            'message.max' =>
                'The offer message must not exceed 3000 characters.',

            'terms.max' =>
                'The offer terms must not exceed 3000 characters.',

            'expires_on.after_or_equal' =>
                'The offer expiry date cannot be in the past.',
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