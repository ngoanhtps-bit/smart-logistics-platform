# Tạo Database trên Supabase (cho project này)

Project: **dqnnwnasojwngvrxhyun**  
URL: `https://dqnnwnasojwngvrxhyun.supabase.co`

---

## Lỗi thường gặp

```
syntax error at or near "supabase"
LINE 1: supabase/migrations/001_initial_schema.sql
```

**Nguyên nhân:** Bạn dán **tên đường dẫn file** vào SQL Editor.  
Supabase chỉ chạy được **mã SQL**, không phải đường dẫn.

**Cách đúng:** Mở file SQL trong Cursor/VS Code → chọn **toàn bộ** → Copy → dán vào SQL Editor → Run.

---

## Bạn đã tạo bảng xong — làm tiếp 2 bước

### Bước A — RLS (bắt buộc để app đọc data)

SQL Editor → copy **`supabase/002_rls_policies.sql`** → Run

### Bước B — GPS demo (tuỳ chọn)

Copy **`supabase/003_seed_tracking.sql`** → Run

### Bước C — Tài xế demo (tuỳ chọn)

Copy **`supabase/004_demo_driver.sql`** → Run (gán tài xế cho SPL-260528-01)

### Bước C2 — Bảng giá tuyến (báo giá từ DB)

Copy **`supabase/006_seed_route_pricing.sql`** → Run  
Tuỳ chọn thêm tuyến: **`007_seed_more_routes.sql`**

Trang dùng DB: `/bang-gia`, `/tuyen/[slug]`, form báo giá, trang chủ (tuyến + marketplace).

### Bước D — Bật Realtime (cập nhật live trên dashboard)

**Lưu ý:** Trang **Database → Replication** có nút **"+ Add destination"** (read replica / warehouse) — **không phải** chỗ bật Realtime cho app.

**Cách dễ nhất — SQL Editor:**

1. Mở file **`supabase/005_enable_realtime.sql`** trong Cursor → Ctrl+A → Copy
2. Supabase → **SQL Editor** → New query → dán → **Run**

Hoặc gõ trực tiếp:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE shipment_tracking;
```

**Cách trên giao diện (nếu project còn mục cũ):**

- **Database → Publications** → chọn `supabase_realtime` → thêm bảng `shipments`, `shipment_tracking`  
- Hoặc sidebar **Realtime** → bật theo từng bảng (tùy phiên bản dashboard)

Sau khi bật, vào **Realtime → Inspector** (nếu có), sửa một dòng trong `shipments` → phải thấy event.

### Bước F — Đăng ký / đăng nhập (Supabase Auth)

1. **Authentication → URL Configuration** (Supabase Dashboard):
   - **Site URL:** `http://localhost:3000` (dev) hoặc `https://logistics-app-blue.vercel.app` (production)
   - **Redirect URLs:** thêm `http://localhost:3000/auth/callback` và `https://logistics-app-blue.vercel.app/auth/callback`

2. Tuỳ chọn: **Authentication → Providers → Email** — tắt **Confirm email** nếu muốn đăng ký xong đăng nhập ngay (không cần xác nhận email).

3. Thêm vào `.env.local` (khuyến nghị cho đồng bộ bảng `users`):

```env
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Project Settings → API → service_role (chỉ server, không public)
```

4. SQL Editor — copy **`supabase/008_auth_users_policy.sql`** → Run (cho phép user sửa profile của mình).

5. SQL Editor — copy **`supabase/009_auth_sync_trigger.sql`** → Run (tự tạo dòng `users` khi đăng ký Auth).

6. Production: xem **[LAUNCH.md](./LAUNCH.md)** — env Vercel, `npm run seed:auth-demo`, deploy.

### Bước F2 — Đăng nhập Google (OAuth)

**Trên Google Cloud Console** ([APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)):

1. Tạo **OAuth client ID** (loại **Web application**).
2. **Authorized JavaScript origins:** `http://localhost:3000`, `https://logistics-app-blue.vercel.app` (và domain riêng nếu có).
3. **Authorized redirect URIs** (bắt buộc — trỏ về Supabase, không phải Vercel):

   `https://dqnnwnasojwngvrxhyun.supabase.co/auth/v1/callback`

4. Lưu **Client ID** và **Client Secret**.

**Trên Supabase** → **Authentication → Providers → Google**:

- Bật **Enable Google**
- Dán Client ID + Client Secret → Save

**Redirect URLs app** (đã có ở Bước F): `/auth/callback` trên localhost và production.

Tuỳ chọn SQL: **`supabase/015_oauth_display_name.sql`** — tên hiển thị từ Google (`full_name`).

App: nút **Đăng nhập bằng Google** tại `/login` và `/register`. Tài khoản Google mới = vai trò **customer**.

5. App:
   - **Đăng ký** `/register` → tạo user Supabase + dòng `users` (vai trò `customer`)
   - **Đăng nhập** `/api/auth/login` → session cookie Supabase
   - **Quên mật khẩu** `/forgot-password`
   - **Tài khoản** `/account` — sửa họ tên, SĐT
   - **Admin → tab Người dùng** — đổi vai trò (cần `SUPABASE_SERVICE_ROLE_KEY`)
   - Đơn khách hàng: API `?scope=mine` lọc theo `customer_id`
   - Demo `*@demo.vn` vẫn dùng được khi **chưa** cấu hình `NEXT_PUBLIC_SUPABASE_URL`

### Bước E — Kiểm tra

```bash
npm run dev
```

Mở http://localhost:3000/api/health — cần thấy:

```json
"shipmentCount": 1
```

---

## Cách 1 — SQL Editor (lần đầu tạo bảng)

### Bước 1
Vào [Supabase Dashboard → SQL Editor](https://supabase.com/dashboard/project/dqnnwnasojwngvrxhyun/sql/new)

### Bước 2
Trong project Cursor, mở file:

**`supabase/RUN_IN_SQL_EDITOR.sql`**

(Dùng file này — tên rõ ràng, tránh nhầm với đường dẫn folder)

### Bước 3
- `Ctrl+A` (chọn hết)
- `Ctrl+C` (copy)
- Dán vào ô SQL trên Supabase
- Dòng đầu tiên phải là comment `--` hoặc `CREATE TYPE`, **không** được là `supabase/...`

### Bước 4
Bấm **Run** (hoặc Ctrl+Enter)

### Bước 5
Vào **Table Editor** → kiểm tra:
- `users` (3 dòng demo)
- `vehicles` (2 dòng)
- `shipments` (1 dòng `SPL-260528-01`)

### Nếu báo lỗi "type already exists"
Bảng đã tạo một phần. Chỉ chạy thêm data:

**`supabase/seed_only.sql`** (copy nội dung file, không dán tên file)

---

## Cách 2 — Prisma (từ máy local)

1. Supabase → **Project Settings → Database** → copy:
   - **Transaction pooler** → `DATABASE_URL` (port 6543)
   - **Direct** → `DIRECT_URL` (port 5432)

2. Thêm vào `.env.local`:

```env
DATABASE_URL=postgresql://postgres.[ref]:[MAT-KHAU]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[MAT-KHAU]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

3. Terminal:

```bash
npm run db:push
npm run db:seed
```

---

## Bật Realtime

**Database → Replication** → bật `shipments`, `shipment_tracking`

---

## Kiểm tra app

```bash
npm run dev
```

Mở: http://localhost:3000/api/health

---

## Env Vercel

| Biến | Giá trị |
|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dqnnwnasojwngvrxhyun.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **API → Publishable key** (`sb_publishable_...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **API → Secret key** (`sb_secret_...`) — chỉ server |
| `DATABASE_URL` | pooled string |
| `DIRECT_URL` | direct string |

Sau đó **Redeploy**.
