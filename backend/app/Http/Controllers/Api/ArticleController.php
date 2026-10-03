<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticlePriceHistory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'category_id' => ['nullable', 'exists:categories,id'],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $articles = Article::with('category')
            ->when($request->category_id, fn ($query) => $query->where('category_id', $request->category_id))
            ->when($request->search, fn ($query) => $query->where('name', 'like', '%'.$request->search.'%'))
            ->orderBy('name')
            ->get();

        if ($request->user()->isStock()) {
            $articles->makeHidden(['price']);
        }

        return $articles;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'ing' => ['nullable', 'string', 'max:100'],
            'quantity' => ['required', 'integer', 'min:0'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
        ]);

        $existingArticle = Article::where('category_id', $data['category_id'])
            ->where('name', $data['name'])
            ->first();
        if ($existingArticle) {
            return response()->json(['message' => 'Un article avec ce nom existe deja dans cette categorie.'], 422);
        }

        
        $article = Article::create([
            ...$data,
            'last_added_at' => $data['quantity'] > 0 ? now() : null,
        ]);

        return response()->json($article->makeHidden(['price']), 201);
    }

    public function update(Request $request, Article $article)
    {
        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('articles')->where('category_id', $article->category_id)->ignore($article),
            ],
            'ing' => ['nullable', 'string', 'max:100'],
            'quantity' => ['required', 'integer', 'min:0'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
        ]);

        if ($data['quantity'] > $article->quantity) {
            $data['last_added_at'] = now();
        }

        $article->update($data);

        return response()->json($article->fresh()->makeHidden(['price']));
    }

    public function updatePrice(Request $request, Article $article)
    {
        $data = $request->validate([
            'price' => ['required'],
        ]);

        $price = $this->normalizeDecimal($data['price']);

        if ($price === null || $price < 0) {
            return response()->json(['message' => 'Le prix doit etre un nombre decimal valide.'], 422);
        }

        $oldPrice = $article->price === null ? null : round((float) $article->price, 2);

        if ($oldPrice !== null && abs($oldPrice - $price) < 0.001) {
            return response()->json([
                'message' => 'Le prix est identique, aucun changement enregistre.',
                'article' => $article->fresh(),
            ], 422);
        }

        $article->update(['price' => $price]);

        ArticlePriceHistory::create([
            'article_id' => $article->id,
            'user_id' => $request->user()->id,
            'price' => $price,
        ]);

        return response()->json($article->fresh());
    }

    public function destroy(Article $article)
    {
        $article->delete();

        return response()->noContent();
    }

    private function normalizeDecimal($value): ?float
    {
        if (is_string($value)) {
            $value = str_replace(',', '.', trim($value));
        }

        return is_numeric($value) ? round((float) $value, 2) : null;
    }
}
