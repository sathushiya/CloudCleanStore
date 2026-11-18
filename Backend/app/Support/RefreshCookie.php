<?php

namespace App\Support;

use Symfony\Component\HttpFoundation\Cookie;

/**
 * The one place the refresh-token cookie is built, so issuing and clearing it
 * always agree on name/path/flags (a forget() with a different path would
 * silently leave the real cookie in place).
 *
 * - HttpOnly: JavaScript can never read the refresh token.
 * - SameSite=Strict + Path=/api/auth: the browser only sends it to our own
 *   /api/auth/* endpoints (refresh, logout), never cross-site and never to
 *   orders/checkout etc. This is the primary CSRF defence; EnsureTrustedOrigin
 *   is the second layer.
 * - remember = true  -> persistent cookie (REFRESH_TOKEN_EXPIRY minutes).
 *   remember = false -> session cookie, gone when the browser closes. The
 *   server-side row expires after REFRESH_TOKEN_EXPIRY either way.
 */
class RefreshCookie
{
    public const NAME = 'refresh_token';
    public const PATH = '/api/auth';

    public static function make(string $rawToken, bool $remember): Cookie
    {
        return cookie(
            self::NAME,
            $rawToken,
            $remember ? (int) config('auth.tokens.refresh_expiry') : 0, // 0 = session cookie
            self::PATH,
            null,
            (bool) config('auth.tokens.refresh_cookie_secure'),
            true,   // httpOnly
            false,  // raw
            'strict'
        );
    }

    public static function forget(): Cookie
    {
        return cookie(
            self::NAME,
            '',
            -2628000, // same "5 years ago" Laravel's CookieJar::forget() uses
            self::PATH,
            null,
            (bool) config('auth.tokens.refresh_cookie_secure'),
            true,
            false,
            'strict'
        );
    }
}
