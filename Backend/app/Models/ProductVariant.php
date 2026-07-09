<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = ['product_id', 'size', 'price', 'shop_stock', 'online_stock'];
    protected $casts = ['price' => 'float', 'shop_stock' => 'integer', 'online_stock' => 'integer'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getTotalStockAttribute(): int
    {
        return $this->shop_stock + $this->online_stock;
    }
}
