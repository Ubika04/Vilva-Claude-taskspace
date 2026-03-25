<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('task_type', 30)->default('task')->after('priority');
            $table->boolean('is_reviewed')->default(false)->after('is_archived');
            $table->integer('score')->nullable()->after('is_reviewed');
            $table->datetime('timebox_start')->nullable()->after('start_date');
            $table->datetime('timebox_end')->nullable()->after('timebox_start');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['task_type', 'is_reviewed', 'score', 'timebox_start', 'timebox_end']);
        });
    }
};
