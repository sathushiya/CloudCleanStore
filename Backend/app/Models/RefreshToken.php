<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class RefreshToken extends Model
{
    protected $fillable = [
        'user_id',
        'token',
        'expires_at',
        'is_revoked',
        'remember',
        'user_agent',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'is_revoked' => 'boolean',
            'remember' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Refresh tokens are stored as a SHA-256 hash; the raw value only ever
     * lives in the client's HttpOnly cookie.
     */
    public static function hashToken(string $raw): string
    {
        return hash('sha256', $raw);
    }

    public static function findByRaw(string $raw): ?self
    {
        return static::where('token', static::hashToken($raw))->with('user')->first();
    }

    public function isValid(): bool
    {
        return !$this->is_revoked && Carbon::now()->isBefore($this->expires_at);
    }
}