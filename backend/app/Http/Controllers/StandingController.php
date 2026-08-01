<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StandingRow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StandingController extends Controller
{
    public function replace(Request $request, string $categoryId)
    {
        $rows = $request->input('rows', []);

        DB::transaction(function () use ($categoryId, $rows) {
            StandingRow::where('category_id', $categoryId)->delete();

            foreach ($rows as $row) {
                StandingRow::create([
                    'id' => $row['id'] ?? (string) Str::uuid(),
                    'category_id' => $categoryId,
                    'club' => $row['club'] ?? '',
                    'j' => $row['j'] ?? 0,
                    'g' => $row['g'] ?? 0,
                    'n' => $row['n'] ?? 0,
                    'p' => $row['p'] ?? 0,
                    'bp' => $row['bp'] ?? 0,
                    'bc' => $row['bc'] ?? 0,
                ]);
            }
        });

        return response()->json(['ok' => true]);
    }
}
