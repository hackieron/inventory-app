<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('return_requests', function (Blueprint $table) {
            $table->id();

            $table->foreignId('borrowing_id')
                ->constrained('borrowings')
                ->cascadeOnDelete();

            $table->foreignId('requester_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('status')->default('pending');

            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('return_requests');
    }
};