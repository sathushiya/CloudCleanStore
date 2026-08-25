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

## Known Limitations

- WhatsApp verification relies on Green API, an unofficial third-party service — requires linking a real WhatsApp account and is not an official Meta integration
- No real payment gateway (Stripe/card) — currently supports Cash on Delivery and manual bank transfer with staff-side confirmation
- Real-time order updates use polling (~8s interval), not WebSockets