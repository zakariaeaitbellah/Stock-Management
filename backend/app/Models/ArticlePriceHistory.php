<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArticlePriceHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'article_id',
        'user_id',
        'price',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function article()
    {
        return $this->belongsTo(Article::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
