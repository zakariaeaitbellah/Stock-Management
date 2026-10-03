<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BonSortieLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'article_id',
        'quantity',
        'month',
        'year',
    ];

    public function article()
    {
        return $this->belongsTo(Article::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
