<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('injuries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('player_id');
            $table->foreign('player_id')->references('id')->on('players')->cascadeOnDelete();

            $table->string('type')->nullable();
            $table->enum('gravite', ['legere', 'moderee', 'grave'])->default('legere');
            $table->date('date')->nullable();
            $table->date('retour_prevu')->nullable();
            $table->string('medecin')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('injuries');
    }
};
