<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreProviderAvailabilityRequest extends FormRequest
{
public function authorize(): bool
{
return true;
}

public function rules(): array
{
return [
'slot_date' => [
'required',
'date',
'after_or_equal:today',
],
'start_time' => [
'required',
'date_format:H:i',
],
'end_time' => [
'required',
'date_format:H:i',
'after:start_time',
],
'status' => [
'sometimes',
'required',
Rule::in([
'available',
'blocked',
]),
],
'note' => [
'nullable',
'string',
'max:500',
],
];
}

public function messages(): array
{
return [
'slot_date.required' =>
'Select an availability date.',

'slot_date.date' =>
'Enter a valid availability date.',

'slot_date.after_or_equal' =>
'Availability cannot be added for a past date.',

'start_time.required' =>
'Select a start time.',

'start_time.date_format' =>
'Enter a valid start time.',

'end_time.required' =>
'Select an end time.',

'end_time.date_format' =>
'Enter a valid end time.',

'end_time.after' =>
'The end time must be after the start time.',

'status.in' =>
'The slot status must be available or blocked.',

'note.max' =>
'The availability note must not exceed 500 characters.',
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