<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('injury_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('injury_id');
            $table->foreign('injury_id')->references('id')->on('injuries')->cascadeOnDelete();
            $table->date('date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('injury_sessions');
    }
};
