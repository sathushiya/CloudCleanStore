<?php

namespace App\Services;

use App\Models\RefreshToken;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Access token: Sanctum bearer token, short-lived (auth.tokens.access_expiry,
 * default 15 min), returned in JSON and kept only in frontend memory.
 *
 * Refresh token: random 64-char value that lives ONLY in an HttpOnly cookie
 * (see App\Support\RefreshCookie). The DB stores its SHA-256 hash, so a leaked
 * refresh_tokens table cannot be replayed. Rotated on every use.
 */
class TokenService
{
    /** Refresh outcomes returned by rotateRefreshToken(). */
    public const REFRESH_OK = 'ok';
    public const REFRESH_INVALID = 'invalid';
    /** Token was rotated moments ago by another tab/request that won the race. */
    public const REFRESH_SUPERSEDED = 'superseded';

    private const SUPERSEDED_GRACE_SECONDS = 60;

    /**
     * Issue a fresh session at login / email verification.
     *
     * Single session per user: all existing Sanctum tokens are deleted and all
     * refresh tokens revoked.
     *
     * @return array{tokens: array{access_token: string, token_type: string, expires_in: int}, refresh_token: string, remember: bool}
     */
    public function issueTokens(User $user, Request $request, bool $remember): array
    {
        $user->tokens()->delete();

        RefreshToken::where('user_id', $user->id)
            ->where('is_revoked', false)
            ->update(['is_revoked' => true]);

        return $this->buildPair($user, $request, $remember);
    }

    /**
     * Validate a raw refresh token (from the cookie), rotate it and issue a new
     * access token.
     *
     * Unlike issueTokens() this does NOT delete the user's other Sanctum tokens:
     * another open tab may still be using its (unexpired) access token. Only
     * already-expired Sanctum tokens are cleaned up.
     *
     * @return array{status: string, tokens?: array, refresh_token?: string, remember?: bool}
     */
    public function rotateRefreshToken(?string $raw, Request $request): array
    {
        if (!is_string($raw) || $raw === '') {
            return ['status' => self::REFRESH_INVALID];
        }

        $refreshToken = RefreshToken::findByRaw($raw);

        if (!$refreshToken) {
            return ['status' => self::REFRESH_INVALID];
        }

        $user = $refreshToken->user;

        if (!$refreshToken->isValid() || !$user || !$user->is_active) {
            return ['status' => $this->wasJustSuperseded($refreshToken)
                ? self::REFRESH_SUPERSEDED
                : self::REFRESH_INVALID];
        }

        // Rotation: the old token can never be used again.
        $refreshToken->update(['is_revoked' => true]);

        $user->tokens()->where('expires_at', '<', Carbon::now())->delete();

        return $this->buildPair($user, $request, (bool) $refreshToken->remember);
    }

    /**
     * Revoke every token for a user (logout, password reset).
     */
    public function revokeAllTokens(User $user): void
    {
        $user->tokens()->delete();
        RefreshToken::where('user_id', $user->id)->update(['is_revoked' => true]);
    }

    public function accessExpiryMinutes(): int
    {
        return (int) config('auth.tokens.access_expiry', 15);
    }

    // ─── Internals ──────────────────────────────────────────────────────────

    private function buildPair(User $user, Request $request, bool $remember): array
    {
        $minutes = $this->accessExpiryMinutes();

        $accessToken = $user->createToken(
            'access_token',
            ['*'],
            Carbon::now()->addMinutes($minutes)
        );

        $raw = Str::random(64);

        RefreshToken::create([
            'user_id' => $user->id,
            'token' => RefreshToken::hashToken($raw),
            'expires_at' => Carbon::now()->addMinutes((int) config('auth.tokens.refresh_expiry', 10080)),
            'is_revoked' => false,
            'remember' => $remember,
            'user_agent' => $request->userAgent(),
            'ip_address' => $request->ip(),
        ]);

        return [
            'status' => self::REFRESH_OK,
            'tokens' => [
                'access_token' => $accessToken->plainTextToken,
                'token_type' => 'Bearer',
                'expires_in' => $minutes * 60,
            ],
            'refresh_token' => $raw,
            'remember' => $remember,
        ];
    }

    /**
     * Two tabs refreshing with the same cookie at the same moment: the first
     * rotates it, the second arrives with the now-revoked token. That second
     * request must still get 401, but it should NOT clear the cookie -- the
     * browser already holds the winner's new cookie, and clearing it would log
     * the user out everywhere. A logout revokes everything, so "a newer live
     * token exists" distinguishes rotation from logout.
     */
    private function wasJustSuperseded(RefreshToken $token): bool
    {
        if (!$token->is_revoked || $token->updated_at === null) {
            return false;
        }

        if ($token->updated_at->lt(Carbon::now()->subSeconds(self::SUPERSEDED_GRACE_SECONDS))) {
            return false;
        }

        return RefreshToken::where('user_id', $token->user_id)
            ->where('id', '>', $token->id)
            ->where('is_revoked', false)
            ->exists();
    }
}
