-- Chốt chuyến tài xế: điều phối gửi offer → tài xế xác nhận → đồng bộ xe
-- Chạy sau 010_operational_tables.sql

ALTER TABLE shipments
  ADD COLUMN IF NOT EXISTS offer_status TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS target_driver_id TEXT REFERENCES drivers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS driver_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS driver_declined_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS driver_report_plate TEXT,
  ADD COLUMN IF NOT EXISTS driver_report_phone TEXT,
  ADD COLUMN IF NOT EXISTS driver_note TEXT;

CREATE INDEX IF NOT EXISTS idx_shipments_target_driver ON shipments(target_driver_id, offer_status);
