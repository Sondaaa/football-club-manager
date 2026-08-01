<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('standings_rows', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('category_id');
            $table->foreign('category_id')->references('id')->on('categories')->cascadeOnDelete();
            $table->string('club')->nullable();
            $table->integer('j')->default(0);
            $table->integer('g')->default(0);
            $table->integer('n')->default(0);
            $table->integer('p')->default(0);
            $table->integer('bp')->default(0);
            $table->integer('bc')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('standings_rows');
    }
};
