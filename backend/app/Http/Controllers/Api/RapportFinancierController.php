<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticlePriceHistory;
use App\Models\Category;
use App\Models\StockMovement;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RapportFinancierController extends Controller
{
    public function show(Request $request)
    {
        $data = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'year' => ['required', 'integer', 'between:2000,2100'],
        ]);

        $year = (int) $data['year'];
        $start = Carbon::create($year, 1, 1)->startOfDay();
        $end = Carbon::create($year, 12, 31)->endOfDay();
        $category = Category::findOrFail($data['category_id']);

        $articles = Article::where('category_id', $category->id)
            ->orderBy('name')
            ->get();

        $lines = $articles->values()->map(function (Article $article, int $index) use ($start, $end) {
            $sorties = StockMovement::where('article_id', $article->id)
                ->whereIn('type', ['decrease', 'sortie_service'])
                ->whereBetween('created_at', [$start, $end])
                ->sum('quantity');

            $stockAtYearEnd = $this->stockAtYearEnd($article, $end);
            $unitPrice = $this->averagePrice($article, $start, $end);
            $sortiesAmount = $unitPrice * $sorties;
            $stockValue = $unitPrice * $stockAtYearEnd;

            return [
                'reference' => $index + 1,
                'designation' => $article->name,
                'sorties_quantity' => (int) $sorties,
                'stock_quantity' => (int) $stockAtYearEnd,
                'unit_price' => round($unitPrice, 2),
                'sorties_amount' => round($sortiesAmount, 2),
                'stock_value' => round($stockValue, 2),
            ];
        });

        $sortiesHt = round($lines->sum('sorties_amount'), 2);
        $stockHt = round($lines->sum('stock_value'), 2);

        return response()->json([
            'category' => $category,
            'year' => $year,
            'period_start' => $start->format('d/m/Y'),
            'period_end' => $end->format('d/m/Y'),
            'lines' => $lines,
            'totals' => [
                'sorties_ht' => $sortiesHt,
                'stock_ht' => $stockHt,
                'sorties_tva' => round($sortiesHt * 0.20, 2),
                'stock_tva' => round($stockHt * 0.20, 2),
                'sorties_ttc' => round($sortiesHt * 1.20, 2),
                'stock_ttc' => round($stockHt * 1.20, 2),
            ],
        ]);
    }

    private function averagePrice(Article $article, Carbon $start, Carbon $end): float
    {
        $average = ArticlePriceHistory::where('article_id', $article->id)
            ->whereBetween('created_at', [$start, $end])
            ->avg('price');

        if ($average !== null) {
            return (float) $average;
        }

        $latestBeforeEnd = ArticlePriceHistory::where('article_id', $article->id)
            ->where('created_at', '<=', $end)
            ->latest()
            ->value('price');

        if ($latestBeforeEnd !== null) {
            return (float) $latestBeforeEnd;
        }

        return $article->price === null ? 0.0 : (float) $article->price;
    }

    private function stockAtYearEnd(Article $article, Carbon $end): int
    {
        $afterEnd = StockMovement::where('article_id', $article->id)
            ->where('created_at', '>', $end)
            ->select('type', DB::raw('SUM(quantity) as quantity'))
            ->groupBy('type')
            ->pluck('quantity', 'type');

        $increasesAfter = (int) ($afterEnd['increase'] ?? 0);
        $decreasesAfter = (int) ($afterEnd['decrease'] ?? 0) + (int) ($afterEnd['sortie_service'] ?? 0);

        return max(0, $article->quantity - $increasesAfter + $decreasesAfter);
    }
}
