<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Goal;
use Illuminate\Http\Request;

class GoalController extends Controller
{
    public function store(Request $request, string $matchId)
    {
        $goal = Goal::create([
            'match_id' => $matchId,
            'player_id' => $request->input('playerId'),
            'minute' => $request->input('minute'),
        ]);

        return response()->json(['id' => $goal->id]);
    }

    public function destroy(string $id)
    {
        Goal::where('id', $id)->delete();

        return response()->json(['ok' => true]);
    }
}
