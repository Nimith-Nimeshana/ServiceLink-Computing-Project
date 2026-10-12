<?php


use Illuminate\Database\Migrations\Migration;

use Illuminate\Database\Schema\Blueprint;

use Illuminate\Support\Facades\Schema;



return new class extends Migration

{

public function up(): void

{

Schema::create('provider_profiles', function (Blueprint $table) {

$table->id();



$table->foreignId('user_id')

->unique()

->constrained('users')

->cascadeOnDelete();



$table->string('business_name', 150);

$table->string('professional_title', 191)->nullable();

$table->text('professional_summary')->nullable();

$table->string('primary_district', 100)->nullable();

$table->string('coverage_area', 255)->nullable();

$table->unsignedSmallInteger('years_experience')->default(0);

$table->string('public_email', 191)->nullable();

$table->string('public_phone', 30)->nullable();



$table->decimal('average_rating', 3, 2)->default(0.00);

$table->unsignedInteger('review_count')->default(0);



$table->timestamps();



$table->index('primary_district');

});

}



public function down(): void

{

Schema::dropIfExists('provider_profiles');

}

};