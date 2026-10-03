<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public function movements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function bonSortieLines()
    {
        return $this->hasMany(BonSortieLine::class);
    }
}
