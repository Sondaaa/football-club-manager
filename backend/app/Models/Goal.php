<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Goal extends Model
{
    use HasUuids;

    protected $fillable = ['id', 'match_id', 'player_id', 'minute'];

    public function fixture()
    {
        return $this->belongsTo(Fixture::class, 'match_id');
    }

    public function player()
    {
        return $this->belongsTo(Player::class);
    }
}
