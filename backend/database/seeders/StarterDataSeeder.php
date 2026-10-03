<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Category;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

class StarterDataSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'stock@test.com'],
            ['name' => 'Compte Stock', 'password' => 'password123', 'role' => 'stock']
        );

        User::updateOrCreate(
            ['email' => 'prix@test.com'],
            ['name' => 'Compte Prix', 'password' => 'password123', 'role' => 'prix']
        );

        $mobilier = Category::updateOrCreate(['name' => 'Mobilier']);
        $fournitures = Category::updateOrCreate(['name' => 'Fournitures']);

        Service::updateOrCreate(['name' => 'Service Financiere']);
        Service::updateOrCreate(['name' => 'Service Informatique']);

        Article::updateOrCreate(
            ['category_id' => $mobilier->id, 'name' => 'bureau'],
            ['quantity' => 10, 'low_stock_threshold' => 2, 'last_added_at' => now()]
        );

        Article::updateOrCreate(
            ['category_id' => $fournitures->id, 'name' => 'stylo'],
            ['quantity' => 500, 'low_stock_threshold' => 100, 'last_added_at' => now()]
        );
    }
}
