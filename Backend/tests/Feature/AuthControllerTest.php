<?php

namespace Tests\Feature;

use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Cookie;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    private const ORIGIN = 'http://localhost:5173';

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function makeUser(): User
    {
        return User::factory()->create([
            'email' => 'login@example.com',
            'password' => 'Passw0rd!',
        ]);
    }

    private function login(bool $remember = false): TestResponse
    {
        return $this->postJson('/api/auth/login', [
            'email' => 'login@example.com',
            'password' => 'Passw0rd!',
            'remember_me' => $remember,
        ]);
    }

    private function refreshCookie(TestResponse $response): Cookie
    {
        $cookie = $response->getCookie('refresh_token', false);
        $this->assertNotNull($cookie, 'refresh_token cookie was not set');

        return $cookie;
    }

    private function refreshWith(?string $raw, string $origin = self::ORIGIN): TestResponse
    {
        // Fresh request state: drop the guard's cached user and cookies from
        // earlier calls in the same test.
        $this->app['auth']->forgetGuards();
        $this->defaultCookies = [];
        $this->unencryptedCookies = [];

        $request = $this->withCredentials()->withHeader('Origin', $origin);

        if ($raw !== null) {
            $request = $request->withUnencryptedCookie('refresh_token', $raw);
        }

        return $request->postJson('/api/auth/refresh');
    }

    // ─── Login: cookie + token shape ─────────────────────────────────────────

    public function test_login_sets_an_httponly_strict_refresh_cookie_and_no_refresh_token_in_json(): void
    {
        $this->makeUser();

        $response = $this->login();

        $response->assertOk()
            ->assertJsonPath('data.tokens.token_type', 'Bearer')
            ->assertJsonPath('data.tokens.expires_in', 900)
            ->assertJsonMissingPath('data.tokens.refresh_token');
        $this->assertNotEmpty($response->json('data.tokens.access_token'));

        $response->assertCookie('refresh_token', null, false);
        $cookie = $this->refreshCookie($response);
        $this->assertTrue($cookie->isHttpOnly());
        $this->assertSame('strict', strtolower((string) $cookie->getSameSite()));
        $this->assertSame('/api/auth', $cookie->getPath());
        $this->assertTrue($cookie->isSecure());
        $this->assertSame(64, strlen($cookie->getValue()));
        $this->assertStringNotContainsString($cookie->getValue(), $response->getContent());
    }

    public function test_access_token_expires_in_about_fifteen_minutes(): void
    {
        $this->makeUser();

        $this->login()->assertOk();

        $token = PersonalAccessToken::latest('id')->first();
        $this->assertNotNull($token->expires_at);
        $minutes = now()->diffInMinutes($token->expires_at);
        $this->assertTrue($minutes > 14 && $minutes <= 15, "expires_at is {$minutes} minutes out");
    }

    public function test_remember_me_true_sets_a_persistent_cookie(): void
    {
        $this->makeUser();

        $cookie = $this->refreshCookie($this->login(true));

        // ~7 days out
        $this->assertGreaterThan(now()->addDays(6)->getTimestamp(), $cookie->getExpiresTime());
        $this->assertDatabaseHas('refresh_tokens', ['remember' => true, 'is_revoked' => false]);
    }

    public function test_remember_me_false_sets_a_session_cookie(): void
    {
        $this->makeUser();

        $cookie = $this->refreshCookie($this->login(false));

        $this->assertSame(0, $cookie->getExpiresTime());
        // Server-side row still lives 7 days.
        $row = RefreshToken::first();
        $this->assertFalse($row->remember);
        $this->assertGreaterThan(now()->addDays(6), $row->expires_at);
    }

    public function test_refresh_token_is_stored_as_a_sha256_hash(): void
    {
        $this->makeUser();

        $raw = $this->refreshCookie($this->login())->getValue();

        $this->assertDatabaseHas('refresh_tokens', ['token' => hash('sha256', $raw)]);
        $this->assertDatabaseMissing('refresh_tokens', ['token' => $raw]);
    }

    // ─── Refresh ──────────────────────────────────────────────────────────────

    public function test_refresh_with_cookie_and_allowed_origin_rotates_tokens_and_never_returns_419(): void
    {
        $this->makeUser();
        $oldRaw = $this->refreshCookie($this->login())->getValue();

        $response = $this->refreshWith($oldRaw);

        $this->assertNotSame(419, $response->status(), 'refresh must never hit CSRF verification');
        $response->assertOk()
            ->assertJsonPath('data.tokens.expires_in', 900)
            ->assertJsonMissingPath('data.tokens.refresh_token');
        $this->assertNotEmpty($response->json('data.tokens.access_token'));

        $newRaw = $this->refreshCookie($response)->getValue();
        $this->assertNotSame($oldRaw, $newRaw);
        $this->assertDatabaseHas('refresh_tokens', ['token' => hash('sha256', $oldRaw), 'is_revoked' => true]);
        $this->assertDatabaseHas('refresh_tokens', ['token' => hash('sha256', $newRaw), 'is_revoked' => false]);

        // Old access token is NOT deleted on refresh (other tabs keep working).
        $this->assertSame(2, PersonalAccessToken::count());

        // Reusing the rotated cookie fails -- but since a newer live token was
        // issued moments ago (another tab won the race), the cookie is left
        // alone rather than wiping the winner's new one.
        $this->refreshWith($oldRaw)->assertUnauthorized()->assertCookieMissing('refresh_token');
    }

    public function test_refresh_keeps_the_remember_choice_across_rotation(): void
    {
        $this->makeUser();
        $raw = $this->refreshCookie($this->login(true))->getValue();

        $response = $this->refreshWith($raw)->assertOk();

        $cookie = $this->refreshCookie($response);
        $this->assertGreaterThan(now()->addDays(6)->getTimestamp(), $cookie->getExpiresTime());
        $this->assertTrue(RefreshToken::where('token', hash('sha256', $cookie->getValue()))->first()->remember);
    }

    public function test_refresh_keeps_a_session_cookie_when_remember_was_off(): void
    {
        $this->makeUser();
        $raw = $this->refreshCookie($this->login(false))->getValue();

        $cookie = $this->refreshCookie($this->refreshWith($raw)->assertOk());

        $this->assertSame(0, $cookie->getExpiresTime());
    }

    public function test_refresh_deletes_only_expired_sanctum_tokens(): void
    {
        $user = $this->makeUser();
        $raw = $this->refreshCookie($this->login())->getValue();
        $expired = $user->createToken('old', ['*'], now()->subMinute());

        $this->refreshWith($raw)->assertOk();

        $this->assertNull(PersonalAccessToken::find($expired->accessToken->id));
        $this->assertSame(2, PersonalAccessToken::count()); // login token + new token
    }

    public function test_refresh_without_cookie_returns_401_and_clears_cookie(): void
    {
        $response = $this->refreshWith(null);

        $response->assertUnauthorized();
        $response->assertCookieExpired('refresh_token');
    }

    public function test_refresh_ignores_a_refresh_token_in_the_body(): void
    {
        $this->makeUser();
        $raw = $this->refreshCookie($this->login())->getValue();

        $this->app['auth']->forgetGuards();
        $this->defaultCookies = [];
        $this->unencryptedCookies = [];

        $this->withHeader('Origin', self::ORIGIN)
            ->postJson('/api/auth/refresh', ['refresh_token' => $raw])
            ->assertUnauthorized();
    }

    public function test_refresh_with_unknown_or_expired_token_returns_401(): void
    {
        $this->makeUser();
        $raw = $this->refreshCookie($this->login())->getValue();

        $this->refreshWith('not-a-real-token')->assertUnauthorized()->assertCookieExpired('refresh_token');

        RefreshToken::query()->update(['expires_at' => now()->subMinute()]);
        $this->refreshWith($raw)->assertUnauthorized()->assertCookieExpired('refresh_token');
    }

    public function test_refresh_for_an_inactive_user_returns_401(): void
    {
        $user = $this->makeUser();
        $raw = $this->refreshCookie($this->login())->getValue();
        $user->update(['is_active' => false]);

        $this->refreshWith($raw)->assertUnauthorized();
    }

    public function test_refresh_from_a_non_allowed_origin_returns_403(): void
    {
        $this->makeUser();
        $raw = $this->refreshCookie($this->login())->getValue();

        $this->refreshWith($raw, 'https://evil.example')->assertForbidden();
        // Token was not consumed by the rejected request.
        $this->assertDatabaseHas('refresh_tokens', ['token' => hash('sha256', $raw), 'is_revoked' => false]);
    }

    public function test_refresh_without_origin_or_referer_returns_403(): void
    {
        $this->makeUser();
        $raw = $this->refreshCookie($this->login())->getValue();

        $this->app['auth']->forgetGuards();
        $this->withCredentials()
            ->withUnencryptedCookie('refresh_token', $raw)
            ->postJson('/api/auth/refresh')
            ->assertForbidden();
    }

    public function test_refresh_accepts_referer_when_origin_is_absent(): void
    {
        $this->makeUser();
        $raw = $this->refreshCookie($this->login())->getValue();

        $this->app['auth']->forgetGuards();
        $this->withCredentials()
            ->withUnencryptedCookie('refresh_token', $raw)
            ->withHeader('Referer', self::ORIGIN . '/account/settings')
            ->postJson('/api/auth/refresh')
            ->assertOk();
    }

    // ─── Logout ───────────────────────────────────────────────────────────────

    public function test_logout_clears_the_cookie_and_revokes_tokens(): void
    {
        $this->makeUser();
        $login = $this->login();
        $access = $login->json('data.tokens.access_token');
        $raw = $this->refreshCookie($login)->getValue();

        $response = $this->withToken($access)
            ->withCredentials()
            ->withUnencryptedCookie('refresh_token', $raw)
            ->withHeader('Origin', self::ORIGIN)
            ->postJson('/api/auth/logout');

        $response->assertOk()->assertCookieExpired('refresh_token');
        $cookie = $this->refreshCookie($response);
        $this->assertSame('/api/auth', $cookie->getPath());
        $this->assertSame(0, PersonalAccessToken::count());
        $this->assertSame(0, RefreshToken::where('is_revoked', false)->count());

        $this->refreshWith($raw)->assertUnauthorized()->assertCookieExpired('refresh_token');
    }

    public function test_logout_from_a_non_allowed_origin_returns_403(): void
    {
        $this->makeUser();
        $access = $this->login()->json('data.tokens.access_token');

        $this->withToken($access)
            ->withHeader('Origin', 'https://evil.example')
            ->postJson('/api/auth/logout')
            ->assertForbidden();
    }

    // ─── Registration ────────────────────────────────────────────────────────

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'Passw0rd!',
            'password_confirmation' => 'Passw0rd!',
            'phone_number' => '+94771234567',
        ], $overrides);
    }

    public function test_registration_requires_a_phone_number(): void
    {
        $payload = $this->validPayload();
        unset($payload['phone_number']);

        $response = $this->postJson('/api/auth/register', $payload);

        $response->assertUnprocessable()->assertJsonValidationErrors('phone_number');
    }

    public function test_registration_rejects_a_phone_without_country_code(): void
    {
        $response = $this->postJson('/api/auth/register', $this->validPayload(['phone_number' => '0771234567']));

        $response->assertUnprocessable();
        $this->assertDatabaseMissing('users', ['email' => 'jane@example.com']);
    }

    public function test_registration_succeeds_with_a_valid_phone_number(): void
    {
        $response = $this->postJson('/api/auth/register', $this->validPayload());

        $response->assertCreated();
        $this->assertDatabaseHas('users', ['email' => 'jane@example.com', 'phone_number' => '+94771234567']);
    }
}
