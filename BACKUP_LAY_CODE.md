# Sao lưu & tiếp tục ở nhà

## File backup (mang về nhà)

Trong thư mục cha `e:\NGO ANH\` có file:

- **`THIET-KE-LOGICTIC-backup-YYYYMMDD.zip`** — mã nguồn (không gồm `node_modules`, `.next`)

## Ở máy nhà — mở project

1. Giải nén ZIP vào thư mục bạn muốn (vd. `D:\LOGICTIC`).
2. Cài Node.js 20+ nếu chưa có.
3. Trong thư mục project:

```bash
npm install
```

4. Tạo file **`.env.local`** (copy từ máy công ty hoặc Vercel → Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Chạy local:

```bash
npm run dev
```

Mở http://localhost:3000

## Git (đã khởi tạo trên máy công ty)

- Xem lịch sử: `git log --oneline`
- Sau khi sửa ở nhà: `git add .` → `git commit -m "mô tả thay đổi"`

### Đẩy lên GitHub (tuỳ chọn)

```bash
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

Ở nhà: `git clone ...` hoặc `git pull` nếu đã push từ công ty.

## SQL Supabase (nhớ chạy trên cloud)

Theo thứ tự trong `HUONG_DAN_SU_DUNG.md` / `LAUNCH.md`, đặc biệt:

- `016_account_approval.sql`
- `017_fix_auth_user_trigger.sql`
- `018_vehicle_categories_cms.sql`

## Deploy production

```bash
npx vercel --prod
```

(hoặc push Git nếu đã nối Vercel với repo)

---

*File này được tạo tự động khi backup — có thể xóa sau khi đã quen quy trình.*
