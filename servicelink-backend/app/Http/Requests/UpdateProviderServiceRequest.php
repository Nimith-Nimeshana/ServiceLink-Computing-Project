<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateProviderServiceRequest extends FormRequest
{
public function authorize(): bool
{
return true;
}

public function rules(): array
{
return [
'category_id' => [
'sometimes',
'required',
'integer',
Rule::exists('categories', 'id')
->where('status', 'active'),
],
'title' => [
'sometimes',
'required',
'string',
'max:191',
],
'description' => [
'sometimes',
'nullable',
'string',
'max:3000',
],
'price_min' => [
'sometimes',
'required',
'numeric',
'min:0',
'max:9999999999.99',
],
'status' => [
'sometimes',
'required',
Rule::in([
'active',
'paused',
]),
],
];
}

public function messages(): array
{
return [
'category_id.exists' =>
'The selected category is unavailable.',

'title.required' =>
'The service title is required.',

'price_min.numeric' =>
'The service price must be a number.',

'price_min.min' =>
'The service price cannot be negative.',

'status.in' =>
'The service status must be active or paused.',
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