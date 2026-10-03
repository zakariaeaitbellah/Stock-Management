<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;

class NotificationController extends Controller
{
    public function lowStock()
    {
        return Article::with('category')
            ->whereNotNull('low_stock_threshold')
            ->whereColumn('quantity', '<=', 'low_stock_threshold')
            ->orderBy('quantity')
            ->get()
            ->map(fn ($article) => [
                'id' => $article->id,
                'name' => $article->name,
                'category' => $article->category?->name,
                'quantity' => $article->quantity,
                'threshold' => $article->low_stock_threshold,
                'message' => "{$article->name} a atteint le seuil de stock.",
            ]);
    }
}
