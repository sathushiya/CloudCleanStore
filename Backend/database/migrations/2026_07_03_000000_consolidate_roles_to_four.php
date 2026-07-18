<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')->where('role', 'delivery')->update(['role' => 'staff']);
        DB::table('users')->where('role', 'supervisor')->update(['role' => 'staffsupervisor']);

        // MODIFY COLUMN is MySQL-only syntax. SQLite (used for the in-memory
        // test database) doesn't enforce ENUM constraints on a text column
        // anyway, so the data-migration updates above are sufficient there.
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'staff', 'staffsupervisor', 'admin') NOT NULL DEFAULT 'customer'");
        }
    }

    public function down(): void
    {
        DB::table('users')->where('role', 'staff')->update(['role' => 'delivery']);
        DB::table('users')->where('role', 'staffsupervisor')->update(['role' => 'supervisor']);

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'staff', 'admin', 'supervisor', 'delivery') NOT NULL DEFAULT 'customer'");
        }
    }
};
