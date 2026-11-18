# Cloud Clean Store

A full-stack e-commerce platform for a Sri Lankan cleaning products retailer, with separate customer, staff, staff supervisor, and admin experiences.

## Tech Stack

- **Backend:** Laravel 13 (PHP 8.3), Sanctum auth, MySQL
- **Frontend:** React 18, TypeScript, Vite 6, Tailwind
- **Image hosting:** Cloudinary
- **Maps:** Leaflet (OpenStreetMap)
- **SMS/OTP:** Twilio (or local log driver for development)
- **WhatsApp verification:** Green API

## Project Structure


## Local Setup

### Backend

```bash
cd Backend
composer install
cp .env.example .env
php artisan key:generate
```

Set your database and service credentials in `.env` (see **Environment Variables** below), then:

```bash
php artisan migrate
php artisan db:seed --class=ProductCatalogSeeder   # optional: loads sample Dash/Cleana products
php artisan serve
```

Backend runs at `http://127.0.0.1:8000`.

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` (or `http://127.0.0.1:5173`).

> **Use the same host name for the frontend and the API in local dev.** The refresh token is a `SameSite=Strict` cookie, so the browser only sends it when the page and the API are on the same site. By default `VITE_API_BASE_URL=/api` and Vite proxies `/api` to the backend, which keeps everything same-origin — leave it that way. If you point `VITE_API_BASE_URL` at an absolute URL instead, it must use the **same host** you open the app on (both `http://localhost:…` or both `http://127.0.0.1:…`); mixing them means the cookie is never sent and every reload logs you out (`/api/auth/refresh` returns 401). Whichever host you use must also be listed in `FRONTEND_URL`, or refresh/logout return 403.

## Environment Variables

Copy `Backend/.env.example` to `Backend/.env` and fill in:

| Variable | Required | Notes |
|---|---|---|
| `DB_*` | Yes | MySQL connection |
| `APP_KEY` | Yes | Generated via `php artisan key:generate` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Yes | Product/brand image uploads |
| `MAIL_*` | Yes | Email OTP delivery |
| `FRONTEND_URL` | Yes | Comma-separated frontend origin(s). Used for CORS **and** the Origin check on `/api/auth/refresh` and `/api/auth/logout` — must match the frontend origin exactly. Never `*` |
| `ACCESS_TOKEN_EXPIRY` | No (defaults to `15`) | Access token lifetime, minutes |
| `REFRESH_TOKEN_EXPIRY` | No (defaults to `10080`) | Refresh token lifetime, minutes (7 days) |
| `REFRESH_COOKIE_SECURE` | No (defaults to `true`) | `Secure` flag on the refresh cookie. Set `false` **only** for local `http://` |
| `SANCTUM_STATEFUL_DOMAINS` | Leave empty | We don't use Sanctum's SPA cookie mode. Listing the frontend here makes Sanctum demand a CSRF token and refresh/logout fail with **419** |
| `SMS_DRIVER` | No (defaults to `log`) | `log` writes OTP codes to `storage/logs/laravel.log` for free local testing; `twilio` sends real SMS |
| `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_FROM` | Only if `SMS_DRIVER=twilio` | |
| `GREEN_API_INSTANCE_ID`, `GREEN_API_TOKEN` | No | WhatsApp detection during signup. Without these, the app still works — WhatsApp status just reports "unknown" instead of true/false |
| `OTP_EXPIRY_MINUTES` | No (defaults to `10`) | |

## Testing

```bash
# Backend
cd Backend
php artisan test

# Frontend
cd Frontend
npm run test
```

## Roles

| Role | Access |
|---|---|
| `customer` | Shop, cart, checkout, orders, wishlist, addresses |
| `staff` | Order fulfillment, delivery status updates |
| `staffsupervisor` | Everything staff can do, plus inventory management and payment confirmation |
| `admin` | Full access: products, brands, staff accounts, notifications |

Roles are set directly in the `users.role` column. New signups are always `customer`; other roles are created via **Admin → Staff Management**.

## Production Deployment Checklist

Before deploying, in your production `.env`:

- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false` — **critical**, leaves stack traces/secrets exposed if left `true`
- [ ] `APP_URL` set to your real backend domain
- [ ] `FRONTEND_URL` set to your real frontend domain (CORS will reject requests otherwise)
- [ ] `REFRESH_COOKIE_SECURE=true` (HTTPS) and `SANCTUM_STATEFUL_DOMAINS` left empty
- [ ] Real database credentials, not local dev ones
- [ ] Real `MAIL_*` credentials
- [ ] Real Cloudinary credentials
- [ ] `php artisan config:cache` and `php artisan route:cache` run after any `.env` change
- [ ] Frontend built via `npm run build` and the `dist/` output deployed, not served via `npm run dev`

## Caching, Sessions & Queues

No `CACHE_STORE`, `SESSION_DRIVER`, or `QUEUE_CONNECTION` are set in `.env`, so all three fall back to Laravel's default: the `database` driver (`cache`, `sessions`, and `jobs` tables, created by the base migrations). This is enough for how the app actually works today:

- **Rate limiting** (`throttle:*` on login/register/OTP routes) is backed by this cache store — live-tested by hammering `/api/auth/login` with bad credentials, which correctly returns `429` on the 6th attempt within a minute.
- **Queued jobs:** nothing in the codebase implements `ShouldQueue` — OTP emails are sent synchronously (`Mail::send()`, not `->queue()`). The `jobs` table exists but stays empty; **no `php artisan queue:work` process is needed** unless queued jobs are added later, in which case that worker becomes a required always-running background process, easy to forget at deploy time.
- **Data caching:** there is currently no `Cache::remember()` anywhere in the app — every product/brand listing hits MySQL fresh on every request. Not a problem at low-to-moderate traffic, but the first thing worth adding if the catalog pages start feeling slow under real load.

**Important if you ever scale beyond a single app server:** the `database` driver for cache/sessions only behaves correctly on a single server. If the deployment ever moves to multiple app instances behind a load balancer, switch `CACHE_STORE`/`SESSION_DRIVER` to `redis` — otherwise each instance enforces its own separate rate limits and sessions, which is a real correctness bug, not just a performance one.

## Authentication

- **Access token** (Sanctum bearer, 15 min) is returned in the login/verify-email/refresh JSON and kept **only in memory** in the frontend (`src/services/api.ts`). It is never written to `localStorage`/`sessionStorage`.
- **Refresh token** (7 days) lives **only** in an `HttpOnly`, `SameSite=Strict` cookie scoped to `Path=/api/auth`, so JS can't read it and the browser only sends it to `/api/auth/refresh` and `/api/auth/logout`. The DB stores its SHA-256 hash. It rotates on every refresh.
- **Remember me** → persistent cookie (7 days). Otherwise a session cookie that disappears when the browser closes. The server-side row expires after 7 days either way.
- **Page reload** → the frontend calls `POST /api/auth/refresh` once (de-duplicated) to restore the session.
- **CSRF**: `SameSite=Strict` + the cookie path, plus an Origin/Referer check against `FRONTEND_URL` on refresh/logout (403 otherwise). Sanctum's stateful SPA mode is deliberately not used, so no `/sanctum/csrf-cookie` and no 419s.
- Logging in again, logging out, or resetting the password revokes all of the user's tokens.

## Known Limitations

- Auth tokens are no longer kept in web storage (see **Authentication**). One consequence: the frontend and API must be reachable on the same site (same host name), or the refresh cookie isn't sent and users are logged out on reload

- WhatsApp verification relies on Green API, an unofficial third-party service — requires linking a real WhatsApp account and is not an official Meta integration
- No real payment gateway (Stripe/card) — currently supports Cash on Delivery and manual bank transfer with staff-side confirmation
- Real-time order updates use polling (~8s interval), not WebSockets