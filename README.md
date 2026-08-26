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

Frontend runs at `http://127.0.0.1:5173`.

## Environment Variables

Copy `Backend/.env.example` to `Backend/.env` and fill in:

| Variable | Required | Notes |
|---|---|---|
| `DB_*` | Yes | MySQL connection |
| `APP_KEY` | Yes | Generated via `php artisan key:generate` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Yes | Product/brand image uploads |
| `MAIL_*` | Yes | Email OTP delivery |
| `FRONTEND_URL` | Yes | Used for CORS — must match your deployed frontend origin exactly |
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

## Known Limitations

- WhatsApp verification relies on Green API, an unofficial third-party service — requires linking a real WhatsApp account and is not an official Meta integration
- No real payment gateway (Stripe/card) — currently supports Cash on Delivery and manual bank transfer with staff-side confirmation
- Real-time order updates use polling (~8s interval), not WebSockets