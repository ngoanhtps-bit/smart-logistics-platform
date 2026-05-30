# Hướng dẫn sử dụng — Logistics Thông minh

**Website production:** https://logistics-app-blue.vercel.app  

Nền tảng logistics: báo giá, đặt đơn, điều phối xe/tài xế, theo dõi GPS, sàn ghép chuyến, quản trị nội dung (tuyến, blog, người dùng).

---

## Mục lục

1. [Vai trò & trang truy cập](#1-vai-trò--trang-truy-cập)
2. [Đăng nhập / đăng xuất](#2-đăng-nhập--đăng-xuất)
3. [Khách truy cập (chưa đăng nhập)](#3-khách-truy-cập-chưa-đăng-nhập)
4. [Khách hàng (customer)](#4-khách-hàng-customer)
5. [Điều phối (dispatcher)](#5-điều-phối-dispatcher)
6. [Tài xế (driver)](#6-tài-xế-driver)
7. [Quản trị (admin)](#7-quản-trị-admin)
8. [Tạo tài khoản nhân viên](#8-tạo-tài-khoản-nhân-viên)
9. [Menu vận hành (sidebar)](#9-menu-vận-hành-sidebar)
10. [Lỗi thường gặp](#10-lỗi-thường-gặp)

---

## 1. Vai trò & trang truy cập

| Vai trò | Mô tả | Trang chính | Ai tạo tài khoản |
|---------|--------|-------------|------------------|
| **Khách truy cập** | Xem web, báo giá, theo dõi mã vận đơn | `/`, `/bang-gia`, `/tracking/...` | Không cần đăng nhập |
| **Khách hàng** | Đặt đơn, xem đơn của mình, hóa đơn | `/customer` | Tự đăng ký / Google |
| **Điều phối** | Gán xe/tài xế, pipeline đơn, fleet, marketplace | `/dispatcher` | Admin gán role |
| **Tài xế** | Nhận chuyến, cập nhật trạng thái, GPS, POD | `/driver` | Admin gán role + SQL `drivers` |
| **Quản trị** | CMS tuyến/blog, phân quyền user, hệ thống | `/admin` | SQL / seed / admin gán |

**Admin** có thể mở thêm `/customer`, `/dispatcher`, `/driver` để kiểm tra.

---

## 2. Đăng nhập / đăng xuất

### Đăng nhập

| Cách | Đường dẫn | Ghi chú |
|------|-----------|---------|
| Google | `/login` → **Đăng nhập bằng Google** | Khuyến nghị cho admin/nhân viên đã cấp quyền trên Supabase |
| Email + mật khẩu | `/login` | Chỉ khi đã đăng ký `/register` hoặc tài khoản demo |
| Đăng ký mới | `/register` | Mặc định vai trò **khách hàng** |

- Dropdown **「Vai trò」** trên form login **chỉ bắt buộc** với email `*@demo.vn`.
- Tài khoản thật (Google/email): quyền lấy từ bảng `users` trên Supabase — **không cần** chọn đúng dropdown.
- Sau khi admin đổi role: **đăng xuất → đăng nhập lại**.

### Đăng xuất

Menu góc phải (trong dashboard) → **Đăng xuất**, hoặc xóa cookie site rồi vào lại `/login`.

### Quên mật khẩu

`/forgot-password` — gửi link reset qua email (cần cấu hình email trên Supabase).

### Tài khoản demo (test)

Chạy trên máy có `.env.local`:

```bash
npm run seed:auth-demo
```

| Email | Mật khẩu | Vào trang |
|-------|----------|-----------|
| `customer@demo.vn` | `demo1234` | `/customer` |
| `dispatcher@demo.vn` | `demo1234` | `/dispatcher` |
| `driver@demo.vn` | `demo1234` | `/driver` |
| `admin@demo.vn` | `demo1234` | `/admin` |

---

## 3. Khách truy cập (chưa đăng nhập)

Dùng được **không cần** tài khoản.

### Trang chủ `/`

- Xem loại xe, tuyến phổ biến, form **Nhận báo giá** (cuộn tới mục báo giá).
- Liên kết hotline, CTA đăng ký/đăng nhập.

### Bảng giá `/bang-gia`

- Giá tuyến lấy từ database (`route_pricing`).
- Tham khảo cont 20FT / 40FT và thời gian vận chuyển.

### Tuyến SEO `/tuyen/[slug]`

- Trang từng tuyến (vd. Hà Nội → TP.HCM) — SEO + báo giá + form quote.
- Admin chỉnh giá tại `/admin` → tab **Tuyến SEO**.

### Loại xe `/xe-container`, `/xe-tai-15-tan`, ...

- Landing theo loại phương tiện.

### Ngành hàng `/nganh-hang/[slug]`

- Trang theo ngành (thép, pallet, máy công nghiệp, ...).

### Blog `/blog`, `/blog/[slug]`

- Tin tức — admin quản lý tab **Tin tức**.

### Tìm kiếm `/tim-kiem`

- Tìm tuyến, xe, nội dung liên quan.

### Theo dõi vận đơn `/tracking/[mã]`

- Nhập mã (vd. `SPL-260528-01`) hoặc mở link trực tiếp.
- Xem trạng thái, bản đồ GPS (nếu có dữ liệu tracking).
- **Không cần đăng nhập** để xem tracking công khai.

### Đăng ký dịch vụ

- `/register` — tạo tài khoản khách hàng.
- `/login` — đăng nhập sau khi có tài khoản.

---

## 4. Khách hàng (customer)

**URL:** https://logistics-app-blue.vercel.app/customer  

**Đăng nhập:** Google hoặc email đã đăng ký. Chỉ xem **đơn của chính mình** (`scope=mine`).

### Chức năng chính

| Mục | Việc làm |
|-----|----------|
| **Tạo đơn mới** | Điền điểm lấy/giao, loại hàng, trọng lượng → gửi yêu cầu vận chuyển |
| **KPI / thống kê** | Tổng vận đơn, đã giao, SLA (ước tính) |
| **Danh sách vận đơn** | Mã đơn, trạng thái, tuyến — bấm vào **Theo dõi** |
| **Địa chỉ đã lưu** | Gợi ý kho/nhà máy/cảng (mẫu trên UI) |
| **Hóa đơn** | Xem hóa đơn gắn với đơn đã giao (nếu đã bật module `012_invoices`) |
| **Thông báo** | Panel góc phải — cập nhật trạng thái đơn |

### Tài khoản `/account`

- Sửa **họ tên**, **số điện thoại**.
- **Đổi mật khẩu** (tài khoản email/password; Google thường không dùng mục này).

### Sàn ghép chuyến `/marketplace`

- Khách hàng **có thể xem** và tham gia đấu giá/ghép chuyến (theo cấu hình quyền).
- Đăng giá thầu, xem trạng thái load.

### Quy trình gợi ý

1. Đăng ký / Google → vào `/customer`.
2. **Tạo đơn mới** → nhận mã vận đơn.
3. Chia sẻ link `/tracking/[mã]` cho người theo dõi.
4. Chờ điều phối gán xe — trạng thái cập nhật trên dashboard & tracking.

---

## 5. Điều phối (dispatcher)

**URL:** https://logistics-app-blue.vercel.app/dispatcher  

**Yêu cầu:** Role `dispatcher` hoặc `admin` trên Supabase.

### Bảng điều phối — các khu vực

| Khu vực | Chức năng |
|---------|-----------|
| **Thao tác nhanh** | Xử lý đơn, thao tác vận hành hàng ngày |
| **Hóa đơn** | Quản lý/xem hóa đơn vận chuyển |
| **KPI live** | Chỉ số tổng quan realtime (nếu bật Supabase Realtime) |
| **Bản đồ live** | Vị trí chuyến đang chạy |
| **Vận đơn đang chạy** | Danh sách đơn active — gán tài xế/xe |
| **Luồng xử lý đơn** | Pipeline: chờ gán → đã gán → lấy hàng → vận chuyển → giao |
| **Đội xe và tài xế** | Fleet — xe available/busy, gán tài xế cho đơn |
| **Ghép chiều về** | Gợi ý tối ưu chuyến trả (dữ liệu mẫu + logic ghép) |
| **Việc cần xử lý** | Task ưu tiên cho điều phối |
| **Phân tích** | Doanh thu / chuyến theo vùng |
| **Supabase live** | Kiểm tra kết nối DB / realtime |

### Gán chuyến cho tài xế

1. Mở **Đội xe và tài xế** hoặc **Vận đơn đang chạy**.
2. Chọn vận đơn → gán **tài xế** + **biển số xe**.
3. Tài xế phải có:
   - Role `driver` trong `users`.
   - Dòng trong bảng `drivers` (`user_id` = UUID Auth của tài xế).

### Sàn ghép chuyến `/marketplace`

| Thao tác | Mô tả |
|----------|--------|
| Xem load | Danh sách chuyến cần ghép / đấu giá |
| Đặt giá thầu | Nhập số tiền, ETA |
| Chấp nhận bid | Gán nhà vận tải cho load |

### Thông báo

- Icon chuông góc phải — sự kiện đơn, gán xe, giao hàng (khi có cấu hình gửi thông báo).

---

## 6. Tài xế (driver)

**URL:** https://logistics-app-blue.vercel.app/driver  

**Yêu cầu:** Role `driver` + bản ghi `drivers` trên Supabase.

### Màn hình chính

| Chức năng | Cách dùng |
|----------|-----------|
| **Chuyến đang gán** | Hiển thị mã vận đơn, tuyến, loại xe, biển số |
| **Theo dõi** | Link sang `/tracking/[mã]` — xem bản đồ khách cũng thấy |
| **Cập nhật trạng thái** | Đã tới điểm lấy → Đã xếp hàng → Đang vận chuyển → **Đã giao hàng** |
| **Gửi GPS** | Bấm gửi vị trí — cần **bật quyền vị trí** trên trình duyệt/điện thoại |
| **Upload POD** | Tải chứng từ giao hàng (ảnh/PDF) lên Storage `documents` |
| **Chat điều phối** | Liên kết hỗ trợ liên lạc (theo UI) |

### Lưu ý

- Không thấy chuyến → kiểm tra điều phối đã **gán `driver_id`** chưa và SQL `drivers` đã link `user_id` chưa.
- Khi chuyển **Đã giao hàng**: hệ thống có thể tạo hóa đơn & gửi thông báo khách (nếu đã cấu hình).

### Dùng trên điện thoại

- Mở Chrome/Safari → đăng nhập Google → `/driver` → thêm **Add to Home Screen** để dùng như app.

---

## 7. Quản trị (admin)

**URL:** https://logistics-app-blue.vercel.app/admin  

**Yêu cầu:** Role `admin` trong bảng `users` (UUID trùng Supabase Auth). Vercel cần `SUPABASE_SERVICE_ROLE_KEY` cho tab Người dùng & CMS.

### Tab **Tuyến SEO**

| Thao tác | Mô tả |
|----------|--------|
| **Sửa** | Chỉnh giá cont 20FT, 40FT, thời gian — **không cần tạo tuyến mới** |
| **+ Thêm tuyến mới** | Từ/Đến, slug, giá — dùng khi có tuyến hoàn toàn mới |
| **Xóa** | Xóa tuyến khỏi `route_pricing` |

Ảnh hưởng: `/bang-gia`, `/tuyen/[slug]`, form báo giá.

### Tab **Loại xe**

- Xem danh sách trang xe tĩnh (`lib/data.ts`).
- Chỉnh nội dung file code hoặc bổ sung CMS sau.

### Tab **Bảng giá**

- Xem tổng hợp giá từ DB; chỉnh chi tiết qua tab **Tuyến SEO** hoặc Supabase Table Editor.

### Tab **Tin tức**

| Thao tác | Mô tả |
|----------|--------|
| Thêm / sửa / xóa bài | Lưu bảng `blog_posts` |
| Hiển thị | `/blog`, `/blog/[slug]` |

### Tab **Người dùng**

| Thao tác | Mô tả |
|----------|--------|
| **Duyệt đăng ký** | User **chờ duyệt** (điều phối/tài xế tự đăng ký) → **Duyệt** / **Từ chối** |
| **Tạo tài khoản** | Admin tạo sẵn (đã duyệt, dùng ngay) |
| Gán role | Đổi vai trò user đã có |
| Tài xế | Tự tạo `drivers` khi **duyệt** hoặc admin tạo tài xế |

### Bảng điều phối (`/dispatcher`)

Tab mặc định **Gán xe & đơn**:
1. Bảng danh sách đơn — lọc **Chờ gán xe** / Đang chạy / Tất cả.
2. Chọn đơn → cột phải **Gán tài xế & xe** → chọn biển số từ đội → **Gán chuyến**.
3. Đơn «Chờ gán» gồm: nháp, báo giá, hoặc chưa có tài xế/biển số (không chỉ đơn quoted).

Các tab khác: **Đội xe**, **Luồng đơn** (kanban + xóa đơn lỗi), **Bản đồ**, **Khác** (KPI, hóa đơn).

### Tab **Loại xe** (CMS → trang chủ)

1. Chạy SQL `supabase/018_vehicle_categories_cms.sql` trên Supabase (lần đầu).
2. Admin → **Loại xe** → **Thêm loại xe** (tên, ảnh URL, tải trọng, hàng phù hợp, kích thước).
3. Bật **Xuất bản** → lưu → xe xuất hiện ngay tại **trang chủ** (mục Danh mục loại xe) và trang `/{slug}`.
4. Có tìm nhanh, chọn tích, xóa/ẩn nhiều dòng.

### Tìm kiếm & xóa hàng loạt

- **Tìm nhanh:** ô tìm trên mỗi tab admin + từng bảng điều phối/khách hàng (lọc theo tên, email, mã SPL, tuyến…).
- **Chọn tích:** cột checkbox + **Chọn tất cả** + **Xóa đã chọn**.
- **Người dùng / khách hàng:** tab Người dùng — lọc vai trò, xóa nhiều tài khoản (không xóa được chính admin đang login).
- **Đơn lỗi / chưa chốt:** `/dispatcher` → mục **Đơn lỗi / chưa chốt** — chỉ xóa đơn **nháp**, **báo giá**, **đã hủy**.
- **Khách hàng:** `/customer` — xóa đơn nháp/báo giá của mình.

### Tab **Hệ thống**

- **Production readiness** — env, health, gợi ý go-live.
- **Supabase live** — test query.
- Danh sách file SQL cần chạy (`010`–`014`, ...).

### Navbar (khi đã login admin)

- Link **Quản trị** → `/admin`.

---

## 8. Tạo tài khoản nhân viên

### Đăng ký công khai (điều phối / tài xế)

1. `/register` → chọn **Điều phối** hoặc **Tài xế** → đăng ký email/mật khẩu.
2. Vào trang **Chờ duyệt** (`/cho-duyet`) — chưa dùng được dashboard.
3. Admin → **Người dùng** → **Duyệt**.
4. Nhân viên đăng xuất → đăng nhập lại → vào `/dispatcher` hoặc `/driver`.

Link nhanh: `/register?role=dispatcher` · `/register?role=driver`

**Lưu ý:** Chạy SQL `supabase/016_account_approval.sql` và `supabase/017_fix_auth_user_trigger.sql` trên Supabase trước khi dùng tính năng này.

### Cách nhanh — Admin tạo trực tiếp (đã duyệt)

1. `/admin` → tab **Người dùng** → **Tạo tài khoản**.
2. Chọn vai trò: **Khách hàng** / **Điều phối** / **Tài xế** (hoặc Quản trị).
3. Nhập họ tên, email, mật khẩu (≥ 6 ký tự) → **Tạo & gửi thông tin đăng nhập**.
4. Gửi email + mật khẩu cho nhân viên → họ vào `/login` (email/mật khẩu, không cần Google).
5. **Tài xế:** hệ thống tự tạo `drivers` — điều phối gán chuyến trên `/dispatcher`.

**Lỗi "Database error creating new user":** thường do chưa chạy `016`/`017` hoặc email đã có trong bảng `users`. Chạy `017_fix_auth_user_trigger.sql` trong SQL Editor, deploy lại app, rồi tạo lại (email trùng sẽ cập nhật mật khẩu & role).

### Cách cũ — Đổi role user đã tự đăng ký

1. Nhân viên **đăng ký** / **Google**.
2. Admin → **Người dùng** → đổi role trong dropdown.
3. Đăng xuất → đăng nhập lại.

### Admin mới

- Admin hiện tại gán role **Quản trị** trong tab Người dùng, **hoặc**
- SQL: `UPDATE public.users SET role = 'admin' WHERE email = '...';` (id phải trùng UUID Auth).

Chi tiết kỹ thuật: `SUPABASE_SETUP.md`, `LAUNCH.md`.

---

## 9. Menu vận hành (sidebar)

Sau khi đăng nhập, sidebar trái (desktop) dùng chung:

| Menu | Trang | Ai dùng được |
|------|-------|----------------|
| Điều phối | `/dispatcher` | dispatcher, admin |
| Sàn ghép chuyến | `/marketplace` | dispatcher, admin, customer |
| Khách hàng | `/customer` | customer, admin |
| App tài xế | `/driver` | driver, admin |
| Quản trị | `/admin` | admin |

**Module thời gian thực** (sidebar): GPS, trạng thái xe, KPI — tích hợp trong các dashboard trên.

---

## 10. Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách xử lý |
|-------------|-------------|------------|
| Không vào `/admin` | Role chưa `admin` hoặc session cũ | Kiểm tra bảng `users`, đăng xuất/login lại bằng **Google** |
| Google login xong vẫn “Khách hàng” | `users.id` ≠ UUID Auth | `INSERT ... ON CONFLICT (email)` với đúng UUID (xem `SUPABASE_SETUP.md`) |
| Tab Người dùng lỗi | Thiếu `SUPABASE_SERVICE_ROLE_KEY` trên Vercel | Thêm env → redeploy |
| Tài xế không thấy chuyến | Thiếu `drivers` hoặc chưa gán đơn | SQL `drivers` + dispatcher gán chuyến |
| Đăng nhập email báo sai MK | Chỉ có Google, chưa đặt password | Dùng **Đăng nhập Google** hoặc Forgot password |
| CMS 401 | Chưa login admin Auth | Login `admin@demo.vn` hoặc Google admin |
| Tracking không có map | Chưa có GPS / chưa gửi từ app tài xế | Tài xế bấm **Gửi GPS** trên `/driver` |
| Giá tuyến không đổi | Cache trang tĩnh | Đợi vài giây sau **Lưu** ở admin; F5 trang `/tuyen/...` |

### Kiểm tra nhanh phiên đăng nhập

Đã login → mở:

https://logistics-app-blue.vercel.app/api/auth/me

Phải thấy `"role": "admin"` (hoặc dispatcher/driver/customer tương ứng).

---

## Phụ lục — Liên kết tài liệu kỹ thuật

| File | Nội dung |
|------|----------|
| `LAUNCH.md` | Go-live Vercel + Supabase |
| `SUPABASE_SETUP.md` | SQL, Auth, Google OAuth |
| `DEPLOY_VERCEL_SUPABASE.md` | Deploy chi tiết |

---

*Bản hướng dẫn theo codebase Logistics Thông minh — cập nhật theo production `logistics-app-blue.vercel.app`.*
