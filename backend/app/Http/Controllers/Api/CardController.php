<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Card;
use Illuminate\Http\Request;

class CardController extends Controller
{
    public function store(Request $request, string $matchId)
    {
        $card = Card::create([
            'match_id' => $matchId,
            'player_id' => $request->input('playerId'),
            'type' => $request->input('type', 'jaune'),
            'minute' => $request->input('minute'),
        ]);

        return response()->json(['id' => $card->id]);
    }

    public function destroy(string $id)
    {
        Card::where('id', $id)->delete();

        return response()->json(['ok' => true]);
    }
}
