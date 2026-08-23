<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone_number',
        'phone_verified_at',
        'has_whatsapp',
        'role',
        'email_verified_at',
        'is_active',
        'is_available',
        'notify_push',
        'notify_email',
        'notify_sms',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'has_whatsapp' => 'boolean',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'is_available' => 'boolean',
            'notify_push' => 'boolean',
            'notify_email' => 'boolean',
            'notify_sms' => 'boolean',
        ];
    }

    // Relationships
    public function otpVerifications()
    {
        return $this->hasMany(OtpVerification::class, 'email', 'email');
    }

    public function refreshTokens()
    {
        return $this->hasMany(RefreshToken::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    public function wishlistItems(): HasMany
    {
        return $this->hasMany(WishlistItem::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function assignedOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'assigned_to');
    }

    // Helpers
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isSupervisor(): bool
    {
        return $this->role === 'staffsupervisor';
    }

    public function isStaff(): bool
    {
        return in_array($this->role, ['staff', 'staffsupervisor']);
    }

    public function isEmailVerified(): bool
    {
        return $this->email_verified_at !== null;
    }
}