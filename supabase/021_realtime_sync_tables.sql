-- Bật Realtime cho đồng bộ liên vai trò (chạy sau 020)
-- Supabase → Database → Publications → supabase_realtime

ALTER PUBLICATION supabase_realtime ADD TABLE shipment_events;
ALTER PUBLICATION supabase_realtime ADD TABLE app_notifications;
