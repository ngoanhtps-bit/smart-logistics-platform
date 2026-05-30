# Deploy Vercel + Supabase (vận hành chính thức)

> Checklist đầy đủ: **[LAUNCH.md](./LAUNCH.md)**

Production: **https://logistics-app-blue.vercel.app**  
Supabase: **dqnnwnasojwngvrxhyun**

---

## 1) Supabase — Database & Auth

1. Chạy SQL theo thứ tự trong **LAUNCH.md** (file `RUN_IN_SQL_EDITOR.sql` → `002` … → `009`).
2. **Authentication → URL Configuration:**
   - Site URL: `https://logistics-app-blue.vercel.app`
   - Redirect URLs: `https://logistics-app-blue.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`
3. (Tuỳ chọn) Tắt **Confirm email** để đăng ký vào app ngay.

---

## 2) Biến môi trường Vercel (bắt buộc)

| Biến | Mô tả |
|------|--------|
| `NEXT_PUBLIC_APP_URL` | `https://logistics-app-blue.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dqnnwnasojwngvrxhyun.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (server only) |

Tuỳ chọn Prisma: `DATABASE_URL`, `DIRECT_URL`.

CLI:

```bash
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

Kiểm tra local:

```bash
npm run check:env
```

Tạo user demo trên Supabase Auth:

```bash
npm run seed:auth-demo
```

---

## 3) Deploy

```bash
npm run build
vercel --prod
```

Windows:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm.cmd run build
vercel --prod
```

---

## 4) Post-deploy

| Kiểm tra | URL |
|----------|-----|
| Health | `/api/health` → `supabase.configured: true` |
| Readiness | `/api/setup/readiness` → `ready: true` |
| Đăng nhập | `/login` → dashboard theo role |
| Khách hàng | `/customer` sau đăng ký + tạo đơn |
| Admin | `/admin` → tab **Hệ thống** + **Người dùng** |

---

## 5) NestJS Socket (tuỳ chọn)

Deploy `backend/api`, set `NEXT_PUBLIC_WS_URL` trên Vercel.
