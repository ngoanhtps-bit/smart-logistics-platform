-- GPS demo cho SPL-260528-01 (chạy sau khi có bảng + data seed)

INSERT INTO shipment_tracking (id, shipment_id, latitude, longitude, speed, timestamp) VALUES
  ('t1', 's1', 20.86, 106.68, 0, NOW() - INTERVAL '2 hours'),
  ('t2', 's1', 19.50, 105.80, 45, NOW() - INTERVAL '90 minutes'),
  ('t3', 's1', 17.80, 107.20, 58, NOW() - INTERVAL '60 minutes'),
  ('t4', 's1', 16.20, 107.80, 62, NOW() - INTERVAL '30 minutes'),
  ('t5', 's1', 15.12, 108.79, 55, NOW())
ON CONFLICT (id) DO NOTHING;
