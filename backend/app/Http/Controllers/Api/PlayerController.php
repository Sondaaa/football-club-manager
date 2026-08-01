<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Player;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    private array $fieldMap = [
        'categoryId' => 'category_id',
        'nom' => 'nom',
        'prenom' => 'prenom',
        'prenomPere' => 'prenom_pere',
        'sexe' => 'sexe',
        'dateNaissance' => 'date_naissance',
        'nationalite' => 'nationalite',
        'etatCivil' => 'etat_civil',
        'telephone' => 'telephone',
        'email' => 'email',
        'adresse' => 'adresse',
        'contactUrgence' => 'contact_urgence',
        'parentInfo' => 'parent_info',
        'poste' => 'poste',
        'numero' => 'numero',
        'taille' => 'taille',
        'poids' => 'poids',
        'groupeSanguin' => 'groupe_sanguin',
        'piedFort' => 'pied_fort',
        'niveauScolaire' => 'niveau_scolaire',
        'etablissement' => 'etablissement',
        'licenceCin' => 'licence_cin',
        'dateInscription' => 'date_inscription',
        'certificatMedical' => 'certificat_medical',
        'assurance' => 'assurance',
        'observations' => 'observations',
        'photoPath' => 'photo_path',
        'etat' => 'etat',
    ];

    private function toColumns(array $input): array
    {
        $out = [];
        foreach ($this->fieldMap as $camel => $column) {
            if (array_key_exists($camel, $input)) {
                $out[$column] = $input[$camel] === '' ? null : $input[$camel];
            }
        }
        return $out;
    }

    public function store(Request $request)
    {
        $columns = $this->toColumns($request->all());
        $player = Player::create($columns);

        return response()->json(['id' => $player->id] + $request->all());
    }

    public function update(Request $request, string $id)
    {
        $player = Player::findOrFail($id);
        $columns = $this->toColumns($request->all());
        $player->update($columns);

        return response()->json(['ok' => true]);
    }

    public function destroy(string $id)
    {
        Player::where('id', $id)->delete();

        return response()->json(['ok' => true]);
    }
}
