<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class StandingRow extends Model
{
    use HasUuids;

    protected $table = 'standings_rows';

    protected $fillable = ['id', 'category_id', 'club', 'j', 'g', 'n', 'p', 'bp', 'bc'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
