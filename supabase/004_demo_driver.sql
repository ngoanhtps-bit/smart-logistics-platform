-- Tài xế demo + gán cho SPL-260528-01 (chạy sau RUN_IN_SQL_EDITOR.sql)

INSERT INTO users (id, role, name, email, password, phone) VALUES
  ('u4', 'driver', 'Nguyễn Văn Hải', 'driver-hai@fleet.local', 'hashed', '0901111222')
ON CONFLICT (email) DO NOTHING;

INSERT INTO drivers (id, user_id, license_number, current_location, vehicle_id) VALUES
  ('d1', 'u4', 'GPLX-DEMO-01', 'QL1A - Quảng Ngãi', 'v1')
ON CONFLICT (id) DO NOTHING;

UPDATE shipments
SET driver_id = 'd1', vehicle_id = 'v1', updated_at = NOW()
WHERE code = 'SPL-260528-01' AND driver_id IS NULL;
