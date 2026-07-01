<?php

namespace App\Services;

use App\Models\RefreshToken;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class TokenService
{
    /**
     * Create both access token and refresh token for a user
     */
    public function createTokenPair(User $user, Request $request): array
    {
        // Delete existing Sanctum tokens for this user (single session per user)
        $user->tokens()->delete();

        // Create Sanctum access token
        $expiresAt = Carbon::now()->addMinutes(
            (int) env('ACCESS_TOKEN_EXPIRY', 60)
        );
        
        $accessToken = $user->createToken(
            'access_token',
            ['*'],
            $expiresAt
        );

        // Create refresh token
        $refreshToken = $this->createRefreshToken($user, $request);

        return [
            'access_token' => $accessToken->plainTextToken,
            'token_type' => 'Bearer',
            'expires_in' => (int) env('ACCESS_TOKEN_EXPIRY', 60) * 60, // seconds
            'refresh_token' => $refreshToken->token,
        ];
    }

    /**
     * Create a refresh token stored in database
     */
    public function createRefreshToken(User $user, Request $request): RefreshToken
    {
        // Revoke old refresh tokens for this user
        RefreshToken::where('user_id', $user->id)
            ->where('is_revoked', false)
            ->update(['is_revoked' => true]);

        return RefreshToken::create([
            'user_id' => $user->id,
            'token' => Str::random(64),
            'expires_at' => Carbon::now()->addMinutes(
                (int) env('REFRESH_TOKEN_EXPIRY', 10080)
            ),
            'is_revoked' => false,
            'user_agent' => $request->userAgent(),
            'ip_address' => $request->ip(),
        ]);
    }

    /**
     * Refresh the access token using a valid refresh token
     */
    public function refreshAccessToken(string $refreshTokenValue, Request $request): ?array
    {
        $refreshToken = RefreshToken::where('token', $refreshTokenValue)
            ->with('user')
            ->first();

        if (!$refreshToken || !$refreshToken->isValid()) {
            return null;
        }

        $user = $refreshToken->user;

        if (!$user || !$user->is_active) {
            return null;
        }

        // Revoke old refresh token (rotation)
        $refreshToken->update(['is_revoked' => true]);

        // Issue new token pair
        return $this->createTokenPair($user, $request);
    }

    /**
     * Revoke all tokens for a user (logout)
     */
    public function revokeAllTokens(User $user): void
    {
        $user->tokens()->delete();
        RefreshToken::where('user_id', $user->id)->update(['is_revoked' => true]);
    }
}