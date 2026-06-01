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

## Đồng bộ cache

Sau mỗi thao tác: `invalidateShipmentFlow()` cập nhật shipments, tracking, journey, ops, notifications, driver-trips.
