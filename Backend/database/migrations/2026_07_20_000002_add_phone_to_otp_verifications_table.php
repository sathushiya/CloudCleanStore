<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('otp_verifications', function (Blueprint $table) {
            $table->string('email', 255)->nullable()->change();
            $table->string('phone', 20)->nullable()->after('email');
        });

        // MODIFY COLUMN / ENUM redefinition is MySQL-only syntax. SQLite (used
        // for the in-memory test database) doesn't enforce ENUM constraints on
        // a text column anyway, so this only needs to run on MySQL.
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE otp_verifications MODIFY COLUMN type ENUM('email_verification', 'password_reset', 'phone_verification') NOT NULL");
        }

        Schema::table('otp_verifications', function (Blueprint $table) {
            $table->index(['phone', 'type'], 'otp_verifications_phone_type_index');
        });
    }

    public function down(): void
    {
        Schema::table('otp_verifications', function (Blueprint $table) {
            $table->dropIndex('otp_verifications_phone_type_index');
            $table->dropColumn('phone');
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE otp_verifications MODIFY COLUMN type ENUM('email_verification', 'password_reset') NOT NULL");
        }

        Schema::table('otp_verifications', function (Blueprint $table) {
            $table->string('email', 255)->nullable(false)->change();
        });
    }
};
