<?php


namespace App\Http\Requests;



use Illuminate\Contracts\Validation\Validator;

use Illuminate\Foundation\Http\FormRequest;

use Illuminate\Http\Exceptions\HttpResponseException;



class UpdateProviderProfileRequest extends FormRequest

{

public function authorize(): bool

{

return true;

}



public function rules(): array

{

return [

'business_name' => [

'required',

'string',

'max:150',

],

'professional_title' => [

'nullable',

'string',

'max:191',

],

'professional_summary' => [

'nullable',

'string',

'max:3000',

],

'primary_district' => [

'nullable',

'string',

'max:100',

],

'coverage_area' => [

'nullable',

'string',

'max:255',

],

'years_experience' => [

'required',

'integer',

'min:0',

'max:80',

],

'public_email' => [

'nullable',

'email',

'max:191',

],

'public_phone' => [

'nullable',

'string',

'max:30',

'regex:/^[0-9+\-\s()]+$/',

],

];

}



public function messages(): array

{

return [

'business_name.required' =>

'The business or provider display name is required.',



'years_experience.required' =>

'The years of experience value is required.',



'years_experience.integer' =>

'Years of experience must be a whole number.',



'public_email.email' =>

'Enter a valid public email address.',



'public_phone.regex' =>

'The public phone number contains invalid characters.',

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