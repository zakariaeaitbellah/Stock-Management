<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\BonSortieLine;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StockMovementController extends Controller
{
    public function store(Request $request, Article $article)
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(['increase', 'decrease'])],
            'quantity' => ['required', 'integer', 'min:1'],
            'service_id' => ['nullable', 'exists:services,id'],
        ]);

        $result = DB::transaction(function () use ($article, $data, $request) {
            $article->refresh();
            $isServiceSortie = $data['type'] === 'decrease' && ! empty($data['service_id']);

            if ($data['type'] === 'decrease' && $article->quantity < $data['quantity']) {
                abort(422, 'Quantite insuffisante en stock.');
            }

            if ($data['type'] === 'increase') {
                $article->increment('quantity', $data['quantity']);
                $article->forceFill(['last_added_at' => now()])->save();
            } else {
                $article->decrement('quantity', $data['quantity']);
            }

            $movement = StockMovement::create([
                'article_id' => $article->id,
                'service_id' => $isServiceSortie ? $data['service_id'] : null,
                'user_id' => $request->user()->id,
                'type' => $isServiceSortie ? 'sortie_service' : $data['type'],
                'quantity' => $data['quantity'],
            ]);

            $bonLine = null;

            if ($isServiceSortie) {
                $bonLine = BonSortieLine::updateOrCreate(
                    [
                        'service_id' => $data['service_id'],
                        'article_id' => $article->id,
                        'month' => now()->month,
                        'year' => now()->year,
                    ],
                    []
                );

                $bonLine->increment('quantity', $data['quantity']);
                $bonLine = $bonLine->fresh(['article', 'service']);
            }

            return [
                'article' => $article->fresh()->makeHidden(['price']),
                'movement' => $movement->load('service'),
                'bon_line' => $bonLine,
            ];
        });

        return response()->json($result, 201);
    }
}
