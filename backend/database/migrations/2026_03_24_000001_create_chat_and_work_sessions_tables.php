<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Chat Channels (auto-created per project) ────────────────────────
        Schema::create('chat_channels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('type')->default('project'); // project, direct, announcement
            $table->text('description')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_archived')->default(false);
            $table->timestamps();

            $table->index(['project_id', 'type']);
        });

        // ── Chat Channel Members ────────────────────────────────────────────
        Schema::create('chat_channel_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('channel_id')->constrained('chat_channels')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role')->default('member'); // admin, member
            $table->timestamp('last_read_at')->nullable();
            $table->boolean('is_muted')->default(false);
            $table->timestamps();

            $table->unique(['channel_id', 'user_id']);
        });

        // ── Chat Messages ───────────────────────────────────────────────────
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('channel_id')->constrained('chat_channels')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('chat_messages')->nullOnDelete();
            $table->text('body');
            $table->string('type')->default('text'); // text, file, system, task_ref
            $table->json('metadata')->nullable(); // file info, task reference, etc.
            $table->json('mentions')->nullable(); // array of user IDs mentioned
            $table->boolean('is_pinned')->default(false);
            $table->timestamp('edited_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['channel_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });

        // ── Chat Message Reactions ──────────────────────────────────────────
        Schema::create('chat_message_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained('chat_messages')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('emoji', 32);
            $table->timestamps();

            $table->unique(['message_id', 'user_id', 'emoji']);
        });

        // ── Employee Work Sessions (clock-in / clock-out) ───────────────────
        Schema::create('work_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('clock_in')->useCurrent();
            $table->timestamp('clock_out')->nullable();
            $table->unsignedInteger('break_minutes')->default(0);
            $table->unsignedInteger('total_minutes')->nullable(); // computed on clock-out
            $table->string('status')->default('active'); // active, on_break, completed
            $table->text('notes')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->json('location')->nullable(); // optional geo data
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'clock_in']);
        });

        // ── Work Session Breaks ─────────────────────────────────────────────
        Schema::create('work_session_breaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_session_id')->constrained('work_sessions')->cascadeOnDelete();
            $table->timestamp('start_time')->useCurrent();
            $table->timestamp('end_time')->nullable();
            $table->string('reason')->nullable(); // lunch, personal, meeting
            $table->timestamps();
        });

        // ── Task Schedule Slots (for overlap prevention) ────────────────────
        Schema::create('task_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('scheduled_start');
            $table->timestamp('scheduled_end');
            $table->string('schedule_type')->default('work'); // work, review, meeting
            $table->boolean('is_locked')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'scheduled_start', 'scheduled_end']);
            $table->index(['task_id', 'user_id']);
        });

        // ── Notification Preferences ────────────────────────────────────────
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('channel')->default('in_app'); // in_app, email, push
            $table->string('event_type'); // task_assigned, task_completed, chat_mention, etc.
            $table->boolean('enabled')->default(true);
            $table->timestamps();

            $table->unique(['user_id', 'channel', 'event_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
        Schema::dropIfExists('task_schedules');
        Schema::dropIfExists('work_session_breaks');
        Schema::dropIfExists('work_sessions');
        Schema::dropIfExists('chat_message_reactions');
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chat_channel_members');
        Schema::dropIfExists('chat_channels');
    }
};
