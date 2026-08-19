<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->unsignedInteger('shop_stock')->nullable()->default(null)->change();
            $table->unsignedInteger('online_stock')->nullable()->default(null)->change();
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->unsignedInteger('shop_stock')->nullable(false)->default(0)->change();
            $table->unsignedInteger('online_stock')->nullable(false)->default(0)->change();
        });
    }
};
