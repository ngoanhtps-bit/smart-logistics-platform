-- Nhật ký điều khiển vận hành (audit / timeline) — chạy sau 019

CREATE TABLE IF NOT EXISTS shipment_events (
  id TEXT PRIMARY KEY,
  shipment_code TEXT NOT NULL REFERENCES shipments(code) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  actor_role TEXT,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipment_events_code ON shipment_events(shipment_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shipment_events_created ON shipment_events(created_at DESC);

ALTER TABLE shipment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_shipment_events" ON shipment_events FOR SELECT USING (true);
CREATE POLICY "public_insert_shipment_events" ON shipment_events FOR INSERT WITH CHECK (true);
