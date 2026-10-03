<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'ing',
        'quantity',
        'price',
        'low_stock_threshold',
        'last_added_at',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'last_added_at' => 'datetime',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function movements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function bonSortieLines()
    {
        return $this->hasMany(BonSortieLine::class);
    }

    public function priceHistories()
    {
        return $this->hasMany(ArticlePriceHistory::class);
    }
}
