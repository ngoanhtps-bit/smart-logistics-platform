# Đẩy code lên GitHub (làm 1 lần ở công ty hoặc nhà)

Repo gợi ý: **`smart-logistics-platform`** (private).

## Cách 1 — GitHub website (không cần cài `gh`)

1. Đăng nhập https://github.com/new  
2. Tên repo: `smart-logistics-platform` · **Private** · không tick README  
3. Chạy trong thư mục project:

```powershell
cd "e:\NGO ANH\THIÊT KẾ LOGICTIC"
git remote add origin https://github.com/TEN-GITHUB-CUA-BAN/smart-logistics-platform.git
git push -u origin main
```

(Thay `TEN-GITHUB-CUA-BAN` — thường là username GitHub, vd. `ngoanhtps-4406` nếu trùng tài khoản Vercel.)

## Cách 2 — Cài GitHub CLI rồi tạo repo tự động

```powershell
winget install GitHub.cli
gh auth login
cd "e:\NGO ANH\THIÊT KẾ LOGICTIC"
gh repo create smart-logistics-platform --private --source=. --remote=origin --push
```

## Về nhà — clone

```powershell
git clone https://github.com/TEN-GITHUB-CUA-BAN/smart-logistics-platform.git
cd smart-logistics-platform
npm install
# copy .env.local vào thư mục
npm run dev
```

## Production

- https://logistics-app-blue.vercel.app  
- Env Vercel giữ nguyên (Supabase keys) — không cần đổi khi chỉ push Git.
