<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('category_id')->nullable();
            $table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();

            $table->date('date')->nullable();
            $table->time('heure')->nullable();
            $table->string('adversaire')->nullable();
            $table->enum('lieu', ['domicile', 'exterieur'])->default('domicile');
            $table->string('competition')->nullable();
            $table->string('journee')->nullable();
            $table->integer('score_nous')->nullable();
            $table->integer('score_adv')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};
