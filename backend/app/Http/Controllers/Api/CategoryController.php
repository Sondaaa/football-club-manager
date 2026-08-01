<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'color' => 'nullable|string|max:20',
        ]);

        $category = Category::create($data);

        return response()->json($category);
    }

    public function destroy(string $id)
    {
        Category::where('id', $id)->delete();

        return response()->json(['ok' => true]);
    }
}
