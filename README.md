# Smart Logistics Platform

> Master spec đầy đủ: xem [`MASTER_SPEC.md`](./MASTER_SPEC.md)

Production-oriented scaffold for a modern Vietnam logistics SaaS platform:

- Next.js 15 App Router, strict TypeScript, TailwindCSS v4
- Conversion landing page for container, truck and mooc rao transport
- Programmatic SEO route pages under `/tuyen/[slug]`
- Vehicle landing pages at `/xe-container`, `/xe-mooc-rao`, `/xe-tai-15-tan`, and related slugs
- Tracking page at `/tracking/[code]`
- Dispatcher, customer and admin dashboard shells
- Structured data helpers, sitemap, robots, OpenGraph metadata

## Run

```bash
npm install
npm run dev
```

## Database (PostgreSQL — optional)

Không có `DATABASE_URL` → app dùng mock in-memory (dev/demo).

```bash
# .env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smart_logistics

npm run db:push
npm run db:seed
```

## Go-live (vận hành chính thức)

**[LAUNCH.md](./LAUNCH.md)** — checklist Supabase SQL, Auth, env Vercel, deploy, kiểm tra.

Chi tiết deploy: **[DEPLOY_VERCEL_SUPABASE.md](./DEPLOY_VERCEL_SUPABASE.md)** · Supabase: **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**

Quick flow:

1. Tạo project Supabase, lấy `DATABASE_URL` (pooled) và `DIRECT_URL` (direct).
2. Thêm env vào Vercel (`Production`, `Preview`, `Development`):
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXT_PUBLIC_APP_URL`
   - `ENFORCE_AUTH=true`
3. Push schema:

```bash
npm run db:push
npm run db:seed
```

4. Deploy:

```bash
vercel --prod
```

PowerShell on this machine blocks `npm.ps1`, so use:

```bash
npm.cmd install
npm.cmd run dev
```

## Suggested Backend Roadmap

Create a separate NestJS service with modules:

- `auth`: JWT, refresh tokens, OTP, RBAC
- `users`: customers, dispatchers, admins, drivers
- `vehicles`: fleet, documents, maintenance, status
- `shipments`: quote, create order, assign vehicle, assign driver, lifecycle status
- `tracking`: GPS ingestion, Socket.io events, ETA
- `pricing`: route pricing, vehicle pricing, quote rules
- `analytics`: revenue, utilization, heatmaps, SLA
- `notifications`: email, SMS, Zalo, push

Core tables should map to the spec: `users`, `vehicles`, `drivers`, `shipments`, `shipment_tracking`, `invoices`, `documents`, `notifications`, `route_pricing`, `reviews`.

## Next Product Steps

1. Replace mock data in `lib/data.ts` with API calls through TanStack Query.
2. Add auth and role-based dashboard guards.
3. Connect Google Maps or Mapbox for real tracking.
4. Add CMS-backed SEO generation for routes, vehicles, industries and blog content.
5. Add Socket.io event handlers for `shipment_created`, `driver_assigned`, `location_updated`, `shipment_delivered`.
