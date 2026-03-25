<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ── Fix status CHECK constraint to include working_on + blocked ──────
        if (DB::getDriverName() === 'sqlite') {
            // SQLite: drop the old CHECK constraint by recreating the column
            // First, remove the CHECK constraint by changing to a plain string
            DB::statement('PRAGMA writable_schema = ON');

            // Get the current CREATE TABLE SQL
            $sql = DB::selectOne("SELECT sql FROM sqlite_master WHERE type='table' AND name='tasks'");
            if ($sql) {
                $oldSql = $sql->sql;
                // Replace the old enum CHECK constraint with updated one
                $newSql = preg_replace(
                    "/\"status\"\s+varchar[^,]*check\s*\(\s*\"status\"\s+in\s*\([^)]+\)\s*\)/i",
                    '"status" varchar not null default \'in_progress\' check ("status" in (\'backlog\', \'todo\', \'in_progress\', \'working_on\', \'review\', \'blocked\', \'completed\'))',
                    $oldSql
                );
                if ($newSql !== $oldSql) {
                    DB::statement("UPDATE sqlite_master SET sql = ? WHERE type='table' AND name='tasks'", [$newSql]);
                }
            }

            DB::statement('PRAGMA writable_schema = OFF');
            DB::statement('PRAGMA integrity_check');
        } else {
            // MySQL
            DB::statement("ALTER TABLE tasks MODIFY COLUMN status ENUM('backlog','todo','in_progress','working_on','review','blocked','completed') NOT NULL DEFAULT 'in_progress'");
        }

        // ── Add pomodoro tracking fields to task_time_logs ──────────────────
        if (!Schema::hasColumn('task_time_logs', 'pomodoro_mode')) {
            Schema::table('task_time_logs', function (Blueprint $table) {
                $table->string('pomodoro_mode', 20)->nullable()->after('is_manual');
                $table->integer('pomodoro_work_minutes')->nullable()->after('pomodoro_mode');
                $table->integer('pomodoro_break_minutes')->nullable()->after('pomodoro_work_minutes');
            });
        }

        // ── Create timebox_presets table ─────────────────────────────────────
        if (!Schema::hasTable('timebox_presets')) {
            Schema::create('timebox_presets', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('name');
                $table->string('time_start', 5);
                $table->string('time_end', 5);
                $table->json('days_of_week')->nullable();
                $table->boolean('is_active')->default(true);
                $table->string('type', 20)->default('break');
                $table->string('color', 7)->default('#94a3b8');
                $table->timestamps();

                $table->index(['user_id', 'is_active']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('timebox_presets');

        if (Schema::hasColumn('task_time_logs', 'pomodoro_mode')) {
            Schema::table('task_time_logs', function (Blueprint $table) {
                $table->dropColumn(['pomodoro_mode', 'pomodoro_work_minutes', 'pomodoro_break_minutes']);
            });
        }

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE tasks MODIFY COLUMN status ENUM('backlog','todo','in_progress','review','completed') NOT NULL DEFAULT 'backlog'");
        }
    }
};
