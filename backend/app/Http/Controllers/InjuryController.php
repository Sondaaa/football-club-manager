<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Injury;
use Illuminate\Http\Request;

class InjuryController extends Controller
{
    public function store(Request $request, string $playerId)
    {
        $injury = Injury::create([
            'player_id' => $playerId,
            'type' => $request->input('type'),
            'gravite' => $request->input('gravite', 'legere'),
            'date' => $request->input('date'),
            'retour_prevu' => $request->input('retourPrevu'),
            'medecin' => $request->input('medecin'),
            'notes' => $request->input('notes'),
        ]);

        return response()->json(['id' => $injury->id]);
    }

    public function update(Request $request, string $id)
    {
        $injury = Injury::findOrFail($id);
        $fields = [];
        foreach (['type', 'gravite', 'date', 'medecin', 'notes'] as $f) {
            if ($request->has($f)) {
                $fields[$f] = $request->input($f);
            }
        }
        if ($request->has('retourPrevu')) {
            $fields['retour_prevu'] = $request->input('retourPrevu');
        }
        $injury->update($fields);

        return response()->json(['ok' => true]);
    }

    public function destroy(string $id)
    {
        Injury::where('id', $id)->delete();

        return response()->json(['ok' => true]);
    }
}
