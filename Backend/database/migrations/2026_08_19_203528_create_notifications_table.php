<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type', 20); // order | staff | product | system
            $table->string('title');
            $table->text('message');
            $table->string('priority', 10)->default('medium'); // low | medium | high
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
