<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = ['type', 'title', 'message', 'priority', 'read_at'];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public static function log(string $type, string $title, string $message, string $priority = 'medium'): self
    {
        return static::create(compact('type', 'title', 'message', 'priority'));
    }
}
