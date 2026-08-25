<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'location_id',
        'name',
        'serial_number',
        'status',
        'purchase_date',
        'image',
        'description',
        'notes',
    ];

    protected $casts = [
        'purchase_date' => 'date',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function borrowings(): HasMany
    {
        return $this->hasMany(Borrowing::class);
    }

    public function histories(): HasMany
    {
        return $this->hasMany(ItemHistory::class);
    }

    public function currentBorrowing()
    {
        return $this->hasOne(Borrowing::class)
            ->whereNull('returned_at')
            ->latestOfMany('borrowed_at');
    }
}