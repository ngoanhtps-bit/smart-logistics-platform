# LOGISTICS PLATFORM MASTER SPEC 2026

Tài liệu ánh xạ master spec → codebase hiện tại (`smart-logistics-platform`).

## Trạng thái triển khai

| Phân hệ | Spec | Trạng thái | Vị trí code |
|---------|------|------------|-------------|
| Website khách hàng | Homepage, báo giá, tracking | MVP UI | `app/page.tsx`, `components/*` |
| Dashboard điều phối | Map, đơn, fleet, KPI | Shell + mock | `app/dispatcher/`, `components/dispatch-board.tsx` |
| Customer dashboard | Đơn, tracking, analytics | Shell | `app/customer/` |
| Admin CMS | SEO, pricing, banners | Shell | `app/admin/` |
| App tài xế | GPS, POD, chat | Section demo | `components/driver-app-section.tsx` |
| SEO tuyến | `/tuyen/[slug]` | SSG + FAQ schema | `app/tuyen/[slug]/` |
| SEO xe | `/xe-*` | SSG + FAQ | `app/[vehicle]/` |
| Tracking | `/tracking/[code]` | Dynamic | `app/tracking/[code]/` |
| Blog SEO | `/blog` | Scaffold | `app/blog/` |
| Structured data | Org, FAQ, Breadcrumb | Done | `lib/seo.ts`, `components/json-ld.tsx` |
| Sitemap / Robots | XML | Done | `app/sitemap.ts`, `app/robots.ts` |
| REST API (BFF) | quotes, shipments, tracking, fleet | Mock + Next API | `app/api/*`, `lib/mock-db.ts` |
| Auth demo | JWT/RBAC roles | Zustand persist | `store/auth.ts`, `/login` |
| Backend NestJS | REST + WebSocket | Schema only | `backend/prisma/schema.prisma` |
| Realtime GPS | Socket.io 10-30s | Polling 20s + animated map | `hooks/use-shipments.ts`, `components/live-map.tsx` |
| Programmatic SEO | Hàng nghìn trang | ~42 tuyến SSG | `lib/seo-routes.ts` → `generateRouteMatrix` |
| Driver app | GPS, POD, status | Dashboard UI | `app/driver/`, `components/driver-dashboard.tsx` |
| Quote form | RHF + Zod + API | Done | `components/quote-form.tsx` |
| Bản đồ thật | OpenStreetMap / Leaflet | Done | `components/map-leaflet.tsx` |
| SSE tracking | 15s stream | Done | `app/api/tracking/[code]/stream` |
| Notifications | API + bell UI | Done | `components/notifications-panel.tsx` |
| Bảng giá SEO | `/bang-gia` | Done | `app/bang-gia/page.tsx` |
| Ngành hàng SEO | `/nganh-hang/[slug]` | 6 trang | `lib/industries.ts` |
| NestJS API | Scaffold | `backend/api/` port 4000 |
| Auth cookie | httpOnly JWT demo | `app/api/auth/login` |

## Tech stack

| Layer | Spec | Hiện tại |
|-------|------|----------|
| Frontend | Next.js 15, TS, Tailwind, shadcn, Framer Motion, Zustand, TanStack Query, RHF, Zod | Next 15, TS, Tailwind v4, Framer Motion, Zustand, TanStack Query, Zod — chưa shadcn/RHF |
| Backend | NestJS, PostgreSQL, Prisma, Redis, Socket.io | Chưa triển khai |
| Maps | Google Maps / Mapbox | Mock map component |
| Deploy | Vercel + Railway/AWS | Local dev |

## Cấu trúc thư mục (đề xuất spec vs thực tế)

```
Spec đề xuất          →  Thực tế hiện tại
/app/(public)/home    →  app/page.tsx
/app/tuyen/[slug]     →  app/tuyen/[slug]/page.tsx
/app/xe/[slug]        →  app/[vehicle]/page.tsx  (URL: /xe-container, ...)
/app/tracking/[code]  →  app/tracking/[code]/page.tsx
/app/blog             →  app/blog/
/app/(dashboard)/...  →  app/customer|dispatcher|admin/
/components           →  components/
/lib                  →  lib/data.ts, lib/seo.ts
```

## Chạy dự án

```bash
npm.cmd install
npm.cmd run dev
```

Build production: `npm.cmd run build` — 18 trang static/SSG (tuyến, xe, dashboard shells).

## Roadmap theo spec (ưu tiên)

### Phase 1 — MVP sản phẩm (4–6 tuần)
1. NestJS monorepo: `auth`, `shipments`, `vehicles`, `tracking`
2. PostgreSQL + Prisma theo bảng spec §13
3. Kết nối `QuoteForm` → API báo giá
4. Google Maps / Mapbox thay mock `LiveMap`
5. JWT + RBAC guard cho dashboard routes

### Phase 2 — Realtime & vận hành (4 tuần)
1. Socket.io: `shipment_created`, `driver_assigned`, `location_updated`, `shipment_delivered`
2. GPS ingestion interval 10–30s
3. Driver app (React Native hoặc PWA)
4. Notification hub: email, SMS, Zalo

### Phase 3 — Scale SEO & marketplace (6+ tuần)
1. CMS admin: routes, vehicles, blog, pricing
2. Programmatic SEO từ `lib/seo-routes.ts` → generateStaticParams hàng nghìn slug
3. AI pricing + backhaul matching (thay mock trong dispatch board)
4. Freight marketplace + bidding

## Database (spec §13)

```
users, vehicles, drivers, shipments, shipment_tracking,
invoices, documents, notifications, route_pricing, reviews
```

Prisma schema nên đặt tại `backend/prisma/schema.prisma` khi khởi tạo NestJS.

## API modules (spec §14)

`auth` · `users` · `vehicles` · `shipments` · `tracking` · `analytics` · `notifications` · `pricing`

## Conversion rules (spec §29)

- CTA above fold: `components/hero.tsx`
- Sticky contact: `app/page.tsx` (hotline + Zalo)
- Trust stats: `lib/data.ts` → `trustStats`
- Fast quote form: `components/quote-form.tsx`
- Customer logos + reviews: `components/trust-logos.tsx`, `components/customer-reviews.tsx`

## Không được giống (spec §30)

Tránh website giới thiệu đơn giản — UI hiện tại hướng SaaS logistics: dashboard, map realtime demo, marketplace section, KPI cards, enterprise tone Navy + Orange CTA.
