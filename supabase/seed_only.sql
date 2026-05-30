-- Chạy file này NẾU bảng đã tạo xong nhưng thiếu data demo
-- (Không chạy nếu chưa có bảng users/vehicles/shipments)

INSERT INTO users (id, role, name, email, password, phone) VALUES
  ('u1', 'customer', 'Khách hàng Demo', 'customer@demo.vn', 'hashed-demo', '0901000001'),
  ('u2', 'dispatcher', 'Điều phối Demo', 'dispatcher@demo.vn', 'hashed-demo', NULL),
  ('u3', 'admin', 'Admin Demo', 'admin@demo.vn', 'hashed-demo', NULL)
ON CONFLICT (email) DO NOTHING;

INSERT INTO vehicles (id, type, plate_number, capacity, status, lat, lng) VALUES
  ('v1', 'Mooc rào', '51H-888.66', '32 tấn', 'busy', 15.12, 108.79),
  ('v2', 'Container 40FT', '15C-442.19', '30 tấn', 'available', 20.86, 106.68)
ON CONFLICT (plate_number) DO NOTHING;

INSERT INTO shipments (id, code, customer_id, pickup_location, delivery_location, cargo_type, weight, vehicle_type, status, eta) VALUES
  ('s1', 'SPL-260528-01', 'u1', 'Cảng Hải Phòng', 'KCN Bình Dương', 'Pallet hàng kho', '22 tấn', 'Mooc rào', 'in_transit', NOW() + INTERVAL '2 days')
ON CONFLICT (code) DO NOTHING;
