<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Fixture;
use App\Models\Injury;
use App\Models\Player;
use App\Models\Setting;
use App\Models\StandingRow;

class StateController extends Controller
{
    public function index()
    {
        $categories = Category::orderBy('name')->get()->map(fn ($c) => [
            'id' => $c->id,
            'name' => $c->name,
            'color' => $c->color,
        ]);

        $injuriesByPlayer = [];
        foreach (Injury::orderByDesc('date')->get() as $inj) {
            $injuriesByPlayer[$inj->player_id] ??= [];
            $injuriesByPlayer[$inj->player_id][] = [
                'id' => $inj->id,
                'type' => $inj->type,
                'gravite' => $inj->gravite,
                'date' => optional($inj->date)->format('Y-m-d'),
                'retourPrevu' => optional($inj->retour_prevu)->format('Y-m-d'),
                'medecin' => $inj->medecin,
                'notes' => $inj->notes,
            ];
        }

        $players = Player::all()->map(fn ($p) => $this->playerToArray($p, $injuriesByPlayer[$p->id] ?? []));

        $matches = Fixture::with(['goals', 'cards'])->orderBy('date')->get()->map(fn ($m) => [
            'id' => $m->id,
            'categoryId' => $m->category_id,
            'date' => optional($m->date)->format('Y-m-d'),
            'heure' => $m->heure,
            'adversaire' => $m->adversaire,
            'lieu' => $m->lieu,
            'competition' => $m->competition,
            'journee' => $m->journee,
            'scoreNous' => $m->score_nous,
            'scoreAdv' => $m->score_adv,
            'buteurs' => $m->goals->map(fn ($g) => [
                'id' => $g->id, 'playerId' => $g->player_id, 'minute' => $g->minute,
            ]),
            'cartons' => $m->cards->map(fn ($c) => [
                'id' => $c->id, 'playerId' => $c->player_id, 'type' => $c->type, 'minute' => $c->minute,
            ]),
        ]);

        $standings = [];
        foreach (StandingRow::all() as $row) {
            $standings[$row->category_id] ??= [];
            $standings[$row->category_id][] = [
                'id' => $row->id, 'club' => $row->club, 'j' => $row->j, 'g' => $row->g,
                'n' => $row->n, 'p' => $row->p, 'bp' => $row->bp, 'bc' => $row->bc,
            ];
        }

        return response()->json([
            'clubName' => Setting::get('clubName', 'Mon Club'),
            'categories' => $categories,
            'players' => $players,
            'matches' => $matches,
            'standings' => $standings,
        ]);
    }

    private function playerToArray(Player $p, array $injuries = []): array
    {
        return [
            'id' => $p->id,
            'categoryId' => $p->category_id,
            'nom' => $p->nom,
            'prenom' => $p->prenom,
            'prenomPere' => $p->prenom_pere,
            'sexe' => $p->sexe,
            'dateNaissance' => optional($p->date_naissance)->format('Y-m-d'),
            'nationalite' => $p->nationalite,
            'etatCivil' => $p->etat_civil,
            'telephone' => $p->telephone,
            'email' => $p->email,
            'adresse' => $p->adresse,
            'contactUrgence' => $p->contact_urgence,
            'parentInfo' => $p->parent_info,
            'poste' => $p->poste,
            'numero' => $p->numero,
            'taille' => $p->taille,
            'poids' => $p->poids,
            'groupeSanguin' => $p->groupe_sanguin,
            'piedFort' => $p->pied_fort,
            'niveauScolaire' => $p->niveau_scolaire,
            'etablissement' => $p->etablissement,
            'licenceCin' => $p->licence_cin,
            'dateInscription' => optional($p->date_inscription)->format('Y-m-d'),
            'certificatMedical' => $p->certificat_medical,
            'assurance' => $p->assurance,
            'observations' => $p->observations,
            'photoPath' => $p->photo_path,
            'etat' => $p->etat,
            'injuries' => $injuries,
        ];
    }
}
