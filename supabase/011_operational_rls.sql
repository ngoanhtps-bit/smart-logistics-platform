-- RLS cho bảng vận hành (010)

ALTER TABLE marketplace_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_bids" ON marketplace_bids FOR SELECT USING (true);
CREATE POLICY "public_insert_bids" ON marketplace_bids FOR INSERT WITH CHECK (true);

CREATE POLICY "public_read_notifications" ON app_notifications FOR SELECT USING (true);
CREATE POLICY "public_insert_notifications" ON app_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_notifications" ON app_notifications FOR UPDATE USING (true);

CREATE POLICY "public_read_documents" ON shipment_documents FOR SELECT USING (true);
CREATE POLICY "public_insert_documents" ON shipment_documents FOR INSERT WITH CHECK (true);
