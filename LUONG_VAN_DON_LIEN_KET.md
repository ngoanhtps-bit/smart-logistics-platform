# Luồng vận đơn liên kết (end-to-end)

## Sơ đồ

```
Khách tạo đơn → Thông báo Điều phối
       ↓
Điều phối gán / gửi chốt app → Thông báo Tài xế
       ↓
Tài xế chốt → Thông báo Điều phối + Khách
       ↓
Tài xế cập nhật trạng thái + GPS → Tracking realtime
       ↓
Giao hàng → POD + Hóa đơn (nếu bật)
```

## Màn hình trung tâm: `/tracking/[mã đơn]`

- **Hành trình 6 bước** (tiến độ %)
- **Nút hành động** theo vai trò đăng nhập
- **Nhật ký sự kiện** (SQL 020)
- Bản đồ GPS + timeline

## Liên kết thông báo

Mọi thông báo có `shipment_code` → bấm vào mở `/tracking/...` và refresh dữ liệu đồng bộ.

## API hành trình

`GET /api/shipments/[code]/journey` — shipment + steps + events + nextActions

## Đồng bộ cache & Realtime

- Sau mỗi thao tác: `invalidateShipmentFlow()` + broadcast tab khác (cùng trình duyệt).
- **Supabase Realtime:** `shipments`, `shipment_events`, `app_notifications` (SQL 005 + 021).
- Header dashboard: badge **「Đồng bộ live」**.
- Admin → Vận hành → **Kiểm tra đồng bộ 4 vai trò** (`/api/sync/verify`).
