<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\OrderItem;
use App\Models\User;

class Order extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'order_number', 'total', 'status', 'delivery_address', 'assigned_to','payment_method', 'payment_status', 'payment_reference', 'payment_proof_url'];
    protected $casts = ['total' => 'float'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Named assignedStaff (not assignedTo) deliberately: Eloquent serializes
    // an eager-loaded relation under the snake_case of its method name, and
    // a relation literally named "assignedTo" would come out as JSON key
    // "assigned_to" -- silently overwriting the real assigned_to column
    // (a plain FK integer) with this full User object. The frontend was
    // comparing that against a numeric id and always getting false.
    public function assignedStaff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }
}
