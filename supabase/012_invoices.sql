-- Hóa đơn vận chuyển (chạy sau 010)

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  shipment_code TEXT NOT NULL REFERENCES shipments(code) ON DELETE CASCADE,
  customer_id TEXT NOT NULL REFERENCES users(id),
  amount TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  note TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id, issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_shipment ON invoices(shipment_code);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_invoices" ON invoices FOR SELECT USING (true);
CREATE POLICY "public_insert_invoices" ON invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_invoices" ON invoices FOR UPDATE USING (true);

-- Hóa đơn demo cho chuyến mẫu
INSERT INTO invoices (id, code, shipment_code, customer_id, amount, status, issued_at, paid_at) VALUES
  ('inv1', 'INV-2026-0528', 'SPL-260528-01', 'u1', '24.8 triệu', 'paid', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day')
ON CONFLICT (code) DO NOTHING;
