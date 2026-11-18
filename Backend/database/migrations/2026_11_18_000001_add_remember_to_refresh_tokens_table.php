<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * `remember` records whether the user ticked "Remember me" at login, so a
     * rotated refresh token keeps issuing the same kind of cookie (persistent
     * vs. session) instead of losing the choice on the first refresh.
     *
     * Existing rows hold plain-text tokens; the app now looks tokens up by
     * SHA-256 hash, so those rows can never match again. Revoke them so they
     * are clearly dead -- affected users simply log in once more.
     */
    public function up(): void
    {
        Schema::table('refresh_tokens', function (Blueprint $table) {
            $table->boolean('remember')->default(false)->after('is_revoked');
        });

        DB::table('refresh_tokens')
            ->where('is_revoked', false)
            ->update(['is_revoked' => true]);
    }

    public function down(): void
    {
        Schema::table('refresh_tokens', function (Blueprint $table) {
            $table->dropColumn('remember');
        });
    }
};
