-- Chạy sau 002_rls_policies.sql — bảng vận hành: đấu giá, thông báo, chứng từ

CREATE TABLE IF NOT EXISTS marketplace_bids (
  id TEXT PRIMARY KEY,
  shipment_code TEXT NOT NULL REFERENCES shipments(code) ON DELETE CASCADE,
  carrier TEXT NOT NULL,
  amount TEXT NOT NULL,
  eta TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bids_shipment ON marketplace_bids(shipment_code, created_at DESC);

CREATE TABLE IF NOT EXISTS app_notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  shipment_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_created ON app_notifications(created_at DESC);

CREATE TABLE IF NOT EXISTS shipment_documents (
  id TEXT PRIMARY KEY,
  shipment_code TEXT NOT NULL REFERENCES shipments(code) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'pod',
  file_name TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '#',
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_shipment ON shipment_documents(shipment_code);
