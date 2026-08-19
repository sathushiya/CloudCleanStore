<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE otp_verifications MODIFY COLUMN email VARCHAR(255) NULL");
        DB::statement("ALTER TABLE otp_verifications ADD COLUMN phone VARCHAR(20) NULL AFTER email");
        DB::statement("ALTER TABLE otp_verifications MODIFY COLUMN type ENUM('email_verification', 'password_reset', 'phone_verification') NOT NULL");
        DB::statement("ALTER TABLE otp_verifications ADD INDEX otp_verifications_phone_type_index (phone, type)");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE otp_verifications DROP INDEX otp_verifications_phone_type_index");
        DB::statement("ALTER TABLE otp_verifications DROP COLUMN phone");
        DB::statement("ALTER TABLE otp_verifications MODIFY COLUMN type ENUM('email_verification', 'password_reset') NOT NULL");
        DB::statement("ALTER TABLE otp_verifications MODIFY COLUMN email VARCHAR(255) NOT NULL");
    }
};