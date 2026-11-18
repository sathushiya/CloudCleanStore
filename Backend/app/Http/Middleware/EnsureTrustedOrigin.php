<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Second CSRF layer for the cookie-authenticated endpoints (/auth/refresh,
 * /auth/logout). The first layer is the refresh cookie's SameSite=Strict.
 *
 * The request's Origin header (or, if a client omits it, the origin part of
 * Referer) must exactly match one of config('cors.allowed_origins'), which is
 * built from FRONTEND_URL. Requests with neither header are rejected: every
 * browser sends Origin on a POST, so a missing one means a non-browser client
 * that has no business using the cookie flow.
 */
class EnsureTrustedOrigin
{
    public function handle(Request $request, Closure $next): Response
    {
        $origin = $this->requestOrigin($request);
        $allowed = array_map(
            fn ($o) => $this->normalize($o),
            (array) config('cors.allowed_origins', [])
        );

        if ($origin === null || in_array('*', $allowed, true) || !in_array($origin, $allowed, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Request origin not allowed.',
            ], 403);
        }

        return $next($request);
    }

    private function requestOrigin(Request $request): ?string
    {
        $origin = $request->headers->get('Origin');

        if ($origin !== null && $origin !== '' && $origin !== 'null') {
            return $this->normalize($origin);
        }

        $referer = $request->headers->get('Referer');

        return $referer ? $this->normalize($referer) : null;
    }

    /** Reduce a URL to lowercase scheme://host[:port]. */
    private function normalize(string $url): ?string
    {
        $parts = parse_url(trim($url));

        if (!$parts || empty($parts['scheme']) || empty($parts['host'])) {
            return null;
        }

        $origin = strtolower($parts['scheme'] . '://' . $parts['host']);

        return isset($parts['port']) ? $origin . ':' . $parts['port'] : $origin;
    }
}
