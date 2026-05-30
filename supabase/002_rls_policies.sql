-- Chạy SAU khi đã tạo bảng (RUN_IN_SQL_EDITOR.sql)
-- Cho phép app đọc/ghi qua publishable key (demo — production nên thắt chặt RLS)

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_pricing ENABLE ROW LEVEL SECURITY;

-- Đọc công khai (demo)
CREATE POLICY "public_read_users" ON users FOR SELECT USING (true);
CREATE POLICY "public_read_vehicles" ON vehicles FOR SELECT USING (true);
CREATE POLICY "public_read_drivers" ON drivers FOR SELECT USING (true);
CREATE POLICY "public_read_shipments" ON shipments FOR SELECT USING (true);
CREATE POLICY "public_read_tracking" ON shipment_tracking FOR SELECT USING (true);
CREATE POLICY "public_read_pricing" ON route_pricing FOR SELECT USING (true);

-- Ghi đơn & tracking (demo)
CREATE POLICY "public_insert_shipments" ON shipments FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_shipments" ON shipments FOR UPDATE USING (true);
CREATE POLICY "public_insert_tracking" ON shipment_tracking FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_vehicles" ON vehicles FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_vehicles" ON vehicles FOR UPDATE USING (true);
CREATE POLICY "public_insert_users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_drivers" ON drivers FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_drivers" ON drivers FOR UPDATE USING (true);
