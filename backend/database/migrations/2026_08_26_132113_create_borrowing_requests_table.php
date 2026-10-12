<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('borrowing_requests', function (Blueprint $table) {
            $table->id();

            $table->foreignId('item_id')
                ->constrained('items')
                ->cascadeOnDelete();

            // User who wants to borrow the item
            $table->foreignId('requester_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->dateTime('expected_return_at')
                ->nullable();

            $table->text('notes')
                ->nullable();

            $table->string('status')
                ->default('pending');

            $table->timestamps();

            $table->index(['item_id', 'status']);
            $table->index(['requester_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('borrowing_requests');
    }
};