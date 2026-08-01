<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Fixture extends Model
{
    use HasUuids;

    protected $table = 'matches';

    protected $fillable = [
        'id', 'category_id', 'date', 'heure', 'adversaire', 'lieu',
        'competition', 'journee', 'score_nous', 'score_adv'
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function goals()
    {
        return $this->hasMany(Goal::class, 'match_id');
    }

    public function cards()
    {
        return $this->hasMany(Card::class, 'match_id');
    }
}
