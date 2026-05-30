-- Smart Logistics Platform — chạy trong Supabase SQL Editor
-- Project: dqnnwnasojwngvrxhyun

CREATE TYPE user_role AS ENUM ('customer', 'dispatcher', 'admin', 'driver');
CREATE TYPE vehicle_status AS ENUM ('available', 'busy', 'maintenance', 'offline');
CREATE TYPE shipment_status AS ENUM (
  'draft', 'quoted', 'assigned', 'pickup', 'loaded', 'in_transit', 'delivered', 'cancelled'
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  role user_role NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  plate_number TEXT UNIQUE NOT NULL,
  capacity TEXT,
  status vehicle_status DEFAULT 'available',
  gps_device_id TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS drivers (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id),
  license_number TEXT NOT NULL,
  current_location TEXT,
  rating DOUBLE PRECISION DEFAULT 5,
  vehicle_id TEXT UNIQUE REFERENCES vehicles(id)
);

CREATE TABLE IF NOT EXISTS shipments (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  customer_id TEXT NOT NULL REFERENCES users(id),
  driver_id TEXT REFERENCES drivers(id),
  vehicle_id TEXT REFERENCES vehicles(id),
  pickup_location TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  cargo_type TEXT NOT NULL,
  weight TEXT,
  dimensions TEXT,
  vehicle_type TEXT,
  status shipment_status DEFAULT 'draft',
  eta TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipment_tracking (
  id TEXT PRIMARY KEY,
  shipment_id TEXT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  speed DOUBLE PRECISION,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tracking_shipment_time ON shipment_tracking(shipment_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS route_pricing (
  id TEXT PRIMARY KEY,
  from_city TEXT NOT NULL,
  to_city TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  container_20 TEXT,
  container_40 TEXT,
  transit_days TEXT,
  meta_title TEXT,
  meta_desc TEXT
);

-- Demo seed (optional)
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

-- Realtime (bật trong Dashboard → Database → Replication)
-- ALTER PUBLICATION supabase_realtime ADD TABLE shipments;
-- ALTER PUBLICATION supabase_realtime ADD TABLE shipment_tracking;
