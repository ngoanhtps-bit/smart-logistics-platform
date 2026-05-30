-- Bật Realtime cho app (panel Supabase live trên /dispatcher)
-- Chạy trong SQL Editor — KHÔNG dán tên file, chỉ dán nội dung SQL

ALTER PUBLICATION supabase_realtime ADD TABLE shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE shipment_tracking;

-- Kiểm tra đã bật chưa:
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
