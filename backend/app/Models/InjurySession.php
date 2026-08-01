<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class InjurySession extends Model
{
    use HasUuids;

    protected $fillable = ['id', 'injury_id', 'date', 'notes'];

    protected $casts = [
        'date' => 'date:Y-m-d',
    ];

    public function injury()
    {
        return $this->belongsTo(Injury::class);
    }
}
