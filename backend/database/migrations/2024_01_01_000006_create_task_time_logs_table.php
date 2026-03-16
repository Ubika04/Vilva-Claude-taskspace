<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_time_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('start_time');
            $table->timestamp('end_time')->nullable();
            $table->timestamp('paused_at')->nullable();
            $table->unsignedInteger('paused_duration')->default(0); // seconds accumulated during pauses
            $table->unsignedInteger('duration')->default(0);        // total seconds when stopped
            $table->enum('status', ['active', 'paused', 'stopped'])->default('active');
            $table->text('notes')->nullable();
            $table->boolean('is_manual')->default(false);           // manually entered log
            $table->timestamps();

            // Enforce: only one active timer per user
            $table->index(['user_id', 'status']);
            $table->index(['task_id', 'user_id']);
            $table->index('start_time');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_time_logs');
    }
};
