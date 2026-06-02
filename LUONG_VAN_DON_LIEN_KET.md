# Luồng vận đơn liên kết (end-to-end)

## Ba không gian tách riêng

| Vai trò | URL | Nội dung chính |
|---------|-----|----------------|
| **Khách** | `/customer` | Tab Tạo đơn · Đơn & hành trình · Hóa đơn |
| **Điều phối** | `/dispatcher` | Hub 3 luồng → tab Điều khiển / Gán & chốt / … |
| **Tài xế** | `/driver` | App riêng (bottom nav): Chốt · Chạy · Lịch sử · Hồ sơ |

Chi tiết một chuyến (tài xế): `/driver/trip/[mã]`

## Sơ đồ

```
Khách (/customer) tạo đơn → Thông báo Điều phối
       ↓
Điều phối (/dispatcher?tab=assign) gửi chốt → Thông báo Tài xế
       ↓
Tài xế (/driver?tab=pending) chốt → Thông báo Điều phối + Khách
       ↓
Tài xế cập nhật + GPS → /tracking/[mã] (bản đồ chung)
       ↓
Giao hàng → POD + Hóa đơn
```

## Màn hình trung tâm: `/tracking/[mã đơn]`

- **Hành trình 6 bước** (tiến độ %)
- **Nút «Về màn làm việc»** theo vai trò đăng nhập (không chỉ tracking)
- **Nhật ký sự kiện** (SQL 020)
- Bản đồ GPS + timeline

## Liên kết thông báo

Mọi thông báo có `shipment_code` → mở **đúng màn vai trò** (khách → `/customer?code=`, tài xế → `/driver`, điều phối → `/dispatcher?assign=`).

## API hành trình

`GET /api/shipments/[code]/journey` — shipment + steps + events + nextActions

## Đồng bộ cache & Realtime

- Sau mỗi thao tác: `invalidateShipmentFlow()` + broadcast tab khác (cùng trình duyệt).
- **Supabase Realtime:** `shipments`, `shipment_events`, `app_notifications` (SQL 005 + 021).
- Header dashboard: badge **「Đồng bộ live」**.
- Admin → Vận hành → **Kiểm tra đồng bộ 4 vai trò** (`/api/sync/verify`).
