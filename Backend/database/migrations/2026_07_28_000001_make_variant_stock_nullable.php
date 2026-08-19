<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE product_variants MODIFY COLUMN shop_stock INT UNSIGNED NULL DEFAULT NULL");
        DB::statement("ALTER TABLE product_variants MODIFY COLUMN online_stock INT UNSIGNED NULL DEFAULT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE product_variants MODIFY COLUMN shop_stock INT UNSIGNED NOT NULL DEFAULT 0");
        DB::statement("ALTER TABLE product_variants MODIFY COLUMN online_stock INT UNSIGNED NOT NULL DEFAULT 0");
    }
};
