<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreProviderQualificationRequest extends FormRequest
{
public function authorize(): bool
{
return true;
}

public function rules(): array
{
return [
'title' => [
'required',
'string',
'max:191',
],
'issuer' => [
'required',
'string',
'max:191',
],
'issued_on' => [
'nullable',
'date',
'before_or_equal:today',
],
'expires_on' => [
'nullable',
'date',
'after_or_equal:issued_on',
],
'document' => [
'required',
'file',
'mimes:pdf,jpg,jpeg,png',
'max:5120',
],
];
}

public function messages(): array
{
return [
'title.required' =>
'The qualification title is required.',

'title.max' =>
'The qualification title must not exceed 191 characters.',

'issuer.required' =>
'The issuing organization is required.',

'issuer.max' =>
'The issuing organization must not exceed 191 characters.',

'issued_on.date' =>
'The issue date must be a valid date.',

'issued_on.before_or_equal' =>
'The issue date cannot be in the future.',

'expires_on.date' =>
'The expiry date must be a valid date.',

'expires_on.after_or_equal' =>
'The expiry date must be on or after the issue date.',

'document.required' =>
'A qualification document is required.',

'document.file' =>
'The qualification document must be a valid file.',

'document.mimes' =>
'The document must be a PDF, JPG, JPEG or PNG file.',

'document.max' =>
'The qualification document must not exceed 5 MB.',
];
}

protected function failedValidation(Validator $validator): void
{
throw new HttpResponseException(
response()->json([
'success' => false,
'message' => 'Please correct the highlighted fields.',
'data' => null,
'errors' => $validator->errors(),
], 422)
);
}
}