<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up(): void
    {
        Schema::create('customer_profiles', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('user_id')
                  ->unique()
                  ->constrained('users')
                  ->cascadeOnDelete();
                  
            $table->string('district', 100)->nullable();
            $table->string('address_line_1', 191)->nullable();
            $table->string('address_line_2', 191)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('preferred_contact_method', 30)->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_profiles');
    }
};
