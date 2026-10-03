<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->unsignedInteger('quantity')->default(0);
            $table->decimal('price', 12, 2)->nullable();
            $table->unsignedInteger('low_stock_threshold')->nullable();
            $table->timestamp('last_added_at')->nullable();
            $table->timestamps();
            $table->unique(['category_id', 'name']);
        });

        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['increase', 'decrease', 'sortie_service']);
            $table->unsignedInteger('quantity');
            $table->timestamps();
        });

        Schema::create('bon_sortie_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('quantity')->default(0);
            $table->unsignedTinyInteger('month');
            $table->unsignedSmallInteger('year');
            $table->timestamps();
            $table->unique(['service_id', 'article_id', 'month', 'year'], 'bon_sortie_monthly_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bon_sortie_lines');
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('services');
        Schema::dropIfExists('articles');
        Schema::dropIfExists('categories');
    }
};
