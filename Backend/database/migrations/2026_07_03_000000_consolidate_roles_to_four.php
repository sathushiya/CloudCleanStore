<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')->where('role', 'delivery')->update(['role' => 'staff']);
        DB::table('users')->where('role', 'supervisor')->update(['role' => 'staffsupervisor']);
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'staff', 'staffsupervisor', 'admin') NOT NULL DEFAULT 'customer'");
    }

    public function down(): void
    {
        DB::table('users')->where('role', 'staff')->update(['role' => 'delivery']);
        DB::table('users')->where('role', 'staffsupervisor')->update(['role' => 'supervisor']);
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'staff', 'admin', 'supervisor', 'delivery') NOT NULL DEFAULT 'customer'");
    }
};
