<?php

use App\Http\Controllers\Api\CardController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\FixtureController;
use App\Http\Controllers\Api\GoalController;
use App\Http\Controllers\Api\InjurySessionController;

use App\Http\Controllers\Api\InjuryController;
use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\StandingController;
use App\Http\Controllers\Api\StateController;
use Illuminate\Support\Facades\Route;

Route::get('/state', [StateController::class, 'index']);

Route::put('/settings/clubName', [SettingController::class, 'setClubName']);

Route::post('/categories', [CategoryController::class, 'store']);
Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

Route::post('/players', [PlayerController::class, 'store']);
Route::patch('/players/{id}', [PlayerController::class, 'update']);
Route::delete('/players/{id}', [PlayerController::class, 'destroy']);

Route::post('/matches', [FixtureController::class, 'store']);
Route::patch('/matches/{id}/score', [FixtureController::class, 'updateScore']);
Route::delete('/matches/{id}', [FixtureController::class, 'destroy']);

Route::post('/matches/{matchId}/goals', [GoalController::class, 'store']);
Route::delete('/goals/{id}', [GoalController::class, 'destroy']);

Route::post('/matches/{matchId}/cards', [CardController::class, 'store']);
Route::delete('/cards/{id}', [CardController::class, 'destroy']);

Route::put('/standings/{categoryId}', [StandingController::class, 'replace']);

Route::post('/players/{playerId}/injuries', [InjuryController::class, 'store']);
Route::patch('/injuries/{id}', [InjuryController::class, 'update']);
Route::delete('/injuries/{id}', [InjuryController::class, 'destroy']);

Route::post('/injuries/{injuryId}/sessions', [InjurySessionController::class, 'store']);
Route::delete('/sessions/{id}', [InjurySessionController::class, 'destroy']);

