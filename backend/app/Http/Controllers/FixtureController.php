<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Fixture;
use Illuminate\Http\Request;

class FixtureController extends Controller
{
    public function store(Request $request)
    {
        $fixture = Fixture::create([
            'category_id' => $request->input('categoryId'),
            'date' => $request->input('date'),
            'heure' => $request->input('heure'),
            'adversaire' => $request->input('adversaire'),
            'lieu' => $request->input('lieu', 'domicile'),
            'competition' => $request->input('competition'),
            'journee' => $request->input('journee'),
        ]);

        return response()->json(['id' => $fixture->id]);
    }

    public function updateScore(Request $request, string $id)
    {
        $fixture = Fixture::findOrFail($id);
        $fixture->update([
            'score_nous' => $request->input('scoreNous'),
            'score_adv' => $request->input('scoreAdv'),
        ]);

        return response()->json(['ok' => true]);
    }

    public function destroy(string $id)
    {
        Fixture::where('id', $id)->delete();

        return response()->json(['ok' => true]);
    }
}
