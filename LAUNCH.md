# Go-live — Logistics Thông minh

Hướng dẫn đưa web vào **vận hành chính thức** (Vercel + Supabase).

**Production:** https://logistics-app-blue.vercel.app  
**Supabase:** `dqnnwnasojwngvrxhyun`

**Hướng dẫn sử dụng (tất cả vai trò):** [HUONG_DAN_SU_DUNG.md](./HUONG_DAN_SU_DUNG.md)

---

## Checklist nhanh (30 phút)

### 1. Supabase SQL (SQL Editor — copy **nội dung** file, không dán đường dẫn)

| Thứ tự | File | Mục đích |
|--------|------|----------|
| 1 | `RUN_IN_SQL_EDITOR.sql` | Bảng + seed cơ bản |
| 2 | `002_rls_policies.sql` | Cho app đọc/ghi data |
| 3 | `003_seed_tracking.sql` | GPS demo |
| 4 | `004_demo_driver.sql` | Tài xế + gán chuyến |
| 5 | `005_enable_realtime.sql` | Realtime dashboard |
| 6 | `006_seed_route_pricing.sql` | Bảng giá |
| 7 | `008_auth_users_policy.sql` | User sửa profile |
| 8 | `009_auth_sync_trigger.sql` | Tự sync user khi đăng ký |
| 9 | `010_operational_tables.sql` | Đấu giá, thông báo, chứng từ |
| 10 | `011_operational_rls.sql` | RLS bảng vận hành |
| 11 | `012_invoices.sql` | Hóa đơn vận chuyển |
| 12 | `013_storage_documents.sql` | Bucket Storage POD (hoặc tạo bucket `documents` public trên UI) |

### 2. Supabase Auth (Dashboard)

**Authentication → URL Configuration**

| Mục | Giá trị |
|-----|---------|
| Site URL | `https://logistics-app-blue.vercel.app` |
| Redirect URLs | `https://logistics-app-blue.vercel.app/auth/callback` |
| | `http://localhost:3000/auth/callback` |

**Providers → Email:** tắt **Confirm email** nếu muốn đăng ký vào app ngay (hoặc bật + hướng dẫn user xác nhận).

### 3. Biến môi trường Vercel

Project → **Settings → Environment Variables** (Production + Preview):

```env
NEXT_PUBLIC_APP_URL=https://logistics-app-blue.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://dqnnwnasojwngvrxhyun.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon key từ Supabase API>
SUPABASE_SERVICE_ROLE_KEY=<service_role — chỉ server, bí mật>
```

Tuỳ chọn: `DATABASE_URL`, `DIRECT_URL` (nếu dùng Prisma).

Kiểm tra local:

```bash
node --env-file=.env.local scripts/check-env.mjs
```

### 4. Tài khoản demo trên Supabase Auth

Sau khi có `SUPABASE_SERVICE_ROLE_KEY` trong `.env.local`:

```bash
node --env-file=.env.local scripts/create-demo-auth-users.mjs
```

Đăng nhập production: `customer@demo.vn` · `dispatcher@demo.vn` · `admin@demo.vn` · `driver@demo.vn` — mật khẩu `demo1234`

### 5. Deploy

```bash
npm run build
vercel --prod
```

Hoặc push Git nếu đã liên kết repo Vercel.

### 6. Kiểm tra sau deploy

| URL | Kỳ vọng |
|-----|---------|
| `/` | Trang chủ, form báo giá |
| `/api/health` | `supabase.configured: true`, `shipmentCount` ≥ 1 |
| `/api/setup/readiness` | `ready: true` |
| `/login` | Đăng nhập Supabase |
| `/register` | Tạo khách hàng mới |
| `/customer` | Đơn của user (sau login) |
| `/dispatcher` | Bản đồ + tạo/gán đơn |
| `/tracking/SPL-260528-01` | Tracking + GPS |
| `/bang-gia` | Giá từ DB |
| `/marketplace` | Đấu giá (lưu DB) — đăng nhập để chấp nhận |
| `/api/search?q=SPL` | Tìm mã vận đơn |
| `/api/invoices?scope=mine` | Hóa đơn khách hàng |
| Tài xế upload POD | File → Supabase Storage |
| Giao hàng → tự tạo hóa đơn | Trạng thái `delivered` |

**Email (tuỳ chọn):** `RESEND_API_KEY` + `EMAIL_FROM` trên Vercel — gửi mail khi gán xe / giao hàng.
| **Admin → Hệ thống** | Panel «Sẵn sàng vận hành» |

---

## Luồng người dùng chính thức

1. **Khách hàng:** Đăng ký → báo giá trang chủ → «Tạo đơn» → xem `/customer` và `/tracking/[mã]`
2. **Điều phối:** `dispatcher@demo.vn` → tạo đơn, gán xe/tài xế
3. **Tài xế:** `driver@demo.vn` → cập nhật trạng thái, gửi GPS
4. **Quản trị:** `admin@demo.vn` → tab **Người dùng** (đổi role), **Hệ thống** (readiness)

---

## Xử lý sự cố

| Triệu chứng | Cách xử lý |
|-------------|------------|
| Đăng nhập redirect về login | Kiểm tra Redirect URL `/auth/callback` trên Supabase |
| `shipmentCount: 0` | Chạy lại `RUN_IN_SQL_EDITOR.sql` + `002` |
| Admin tab Người dùng lỗi | Thêm `SUPABASE_SERVICE_ROLE_KEY` trên Vercel, redeploy |
| Đăng ký không vào được | Tắt confirm email hoặc xác nhận email trước |
| Build OOM local | Deploy trên Vercel (build cloud) |

---

Chi tiết Supabase: **SUPABASE_SETUP.md** · Deploy: **DEPLOY_VERCEL_SUPABASE.md**
