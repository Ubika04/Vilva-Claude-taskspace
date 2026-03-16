<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('target_value', 10, 2)->default(100);
            $table->decimal('current_value', 10, 2)->default(0);
            $table->string('unit', 50)->default('%');   // e.g. tasks, hours, bugs, %
            $table->date('start_date')->nullable();
            $table->date('due_date')->nullable();
            $table->enum('status', ['active', 'completed', 'paused'])->default('active');
            $table->string('color', 7)->default('#6366f1');
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};
