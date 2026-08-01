<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasUuids;

    protected $fillable = ['id', 'name', 'color'];

    public function players()
    {
        return $this->hasMany(Player::class);
    }

    public function matches()
    {
        return $this->hasMany(Fixture::class);
    }

    public function standingsRows()
    {
        return $this->hasMany(StandingRow::class);
    }
}
