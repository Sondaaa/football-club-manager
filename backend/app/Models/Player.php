<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
    use HasUuids;

    protected $fillable = [
        'id', 'category_id', 'nom', 'prenom', 'prenom_pere', 'sexe', 'date_naissance',
        'nationalite', 'etat_civil', 'telephone', 'email', 'adresse', 'contact_urgence',
        'parent_info', 'poste', 'numero', 'taille', 'poids', 'groupe_sanguin', 'pied_fort',
        'niveau_scolaire', 'etablissement', 'licence_cin', 'date_inscription',
        'certificat_medical', 'assurance', 'observations', 'photo_path', 'etat'
    ];

    protected $casts = [
        'date_naissance' => 'date:Y-m-d',
        'date_inscription' => 'date:Y-m-d',
        'certificat_medical' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function goals()
    {
        return $this->hasMany(Goal::class);
    }

    public function cards()
    {
        return $this->hasMany(Card::class);
    }

    public function injuries()
    {
        return $this->hasMany(Injury::class);
    }
}
