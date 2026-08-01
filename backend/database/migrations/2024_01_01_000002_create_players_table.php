<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('players', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('category_id')->nullable();
            $table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();

            // Identite
            $table->string('nom')->nullable();
            $table->string('prenom')->nullable();
            $table->string('prenom_pere')->nullable();
            $table->string('sexe')->nullable();
            $table->date('date_naissance')->nullable();
            $table->string('nationalite')->nullable();
            $table->string('etat_civil')->nullable();

            // Contact
            $table->string('telephone')->nullable();
            $table->string('email')->nullable();
            $table->string('adresse')->nullable();
            $table->string('contact_urgence')->nullable();
            $table->string('parent_info')->nullable();

            // Fiche sportive
            $table->string('poste')->nullable();
            $table->string('numero')->nullable();
            $table->decimal('taille', 5, 1)->nullable();
            $table->decimal('poids', 5, 1)->nullable();
            $table->string('groupe_sanguin')->nullable();
            $table->string('pied_fort')->nullable();

            // Scolarite
            $table->string('niveau_scolaire')->nullable();
            $table->string('etablissement')->nullable();

            // Administratif
            $table->string('licence_cin')->nullable();
            $table->date('date_inscription')->nullable();
            $table->boolean('certificat_medical')->default(false);
            $table->string('assurance')->nullable();
            $table->text('observations')->nullable();
            $table->string('photo_path')->nullable();

            // Etat du joueur
            $table->enum('etat', ['actif', 'blesse', 'suspendu', 'pret', 'libere'])->default('actif');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('players');
    }
};
