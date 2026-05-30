# Smart Logistics Backend (NestJS — Phase 1)

## NestJS API (đã scaffold)

```bash
cd backend/api
npm install
npm run start:dev
# → http://localhost:4000/health
# → http://localhost:4000/shipments
```

Frontend kết nối NestJS:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Khởi tạo thêm modules

```bash
cd backend/api
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @prisma/client
npm install -D prisma
npx prisma init --schema ../prisma/schema.prisma
```

## Modules (theo Master Spec §14)

| Module | Endpoints |
|--------|-----------|
| `auth` | POST /auth/login, /auth/refresh, /auth/otp |
| `users` | CRUD users, RBAC |
| `vehicles` | Fleet, documents, maintenance |
| `shipments` | Quote, create, assign, status lifecycle |
| `tracking` | GPS ingest, WebSocket broadcast |
| `pricing` | Route + vehicle pricing rules |
| `analytics` | Revenue, utilization, heatmap |
| `notifications` | Email, SMS, Zalo, push |

## WebSocket events (§15)

- `shipment_created`
- `driver_assigned`
- `location_updated` (interval 10–30s)
- `shipment_delivered`

## Database

Schema: `backend/prisma/schema.prisma`

```bash
# .env
DATABASE_URL="postgresql://user:pass@localhost:5432/smart_logistics"
npx prisma migrate dev
```

## Frontend integration

Next.js BFF hiện tại: `app/api/*` (mock). Khi backend sẵn sàng, đổi `lib/api/client.ts`:

```env
NEXT_PUBLIC_API_URL=https://api.smartlogistics.vn
```
