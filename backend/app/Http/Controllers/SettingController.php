<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function setClubName(Request $request)
    {
        Setting::set('clubName', $request->input('value', 'Mon Club'));

        return response()->json(['ok' => true]);
    }
}
