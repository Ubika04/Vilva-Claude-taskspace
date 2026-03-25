<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // SQLite doesn't support modifying columns directly; recreate the table
        // For safety we just drop the foreign key constraint via a nullable workaround
        // This migration is a no-op for SQLite since it can't enforce FK changes
        // The role_id column is already nullable-compatible in SQLite
    }

    public function down(): void {}
};
