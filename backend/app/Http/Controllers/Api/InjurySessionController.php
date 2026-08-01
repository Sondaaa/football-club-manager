<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InjurySession;
use Illuminate\Http\Request;

class InjurySessionController extends Controller
{
    public function store(Request $request, string $injuryId)
    {
        $session = InjurySession::create([
            'injury_id' => $injuryId,
            'date' => $request->input('date'),
            'notes' => $request->input('notes'),
        ]);

        return response()->json(['id' => $session->id]);
    }

    public function destroy(string $id)
    {
        InjurySession::where('id', $id)->delete();

        return response()->json(['ok' => true]);
    }
}
