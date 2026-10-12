<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class SubmitProviderApplicationRequest extends FormRequest
{
public function authorize(): bool
{
return true;
}

public function rules(): array
{
return [
'declaration_accepted' => [
'required',
'accepted',
],
];
}

public function messages(): array
{
return [
'declaration_accepted.required' =>
'The provider declaration must be accepted.',

'declaration_accepted.accepted' =>
'The provider declaration must be accepted before submission.',
];
}

protected function failedValidation(Validator $validator): void
{
throw new HttpResponseException(
response()->json([
'success' => false,
'message' =>
'Please complete the provider declaration.',
'data' => null,
'errors' => $validator->errors(),
], 422)
);
}
}