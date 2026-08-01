<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Injury extends Model
{
    use HasUuids;

    protected $fillable = ['id', 'player_id', 'type', 'gravite', 'date', 'retour_prevu', 'medecin', 'notes'];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'retour_prevu' => 'date:Y-m-d',
    ];

    public function player()
    {
        return $this->belongsTo(Player::class);
    }
}
