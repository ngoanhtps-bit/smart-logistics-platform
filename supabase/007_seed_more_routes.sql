-- Thêm tuyến (tuỳ chọn, sau 006)

INSERT INTO route_pricing (id, from_city, to_city, slug, container_20, container_40, transit_days, meta_title, meta_desc) VALUES
  ('rp4', 'Đà Nẵng', 'TP.HCM', 'da-nang-tp-hcm', '10.5 triệu', '13 triệu', '1-2 ngày', 'Đà Nẵng đi TP.HCM', 'Tuyến Trung – Nam nhanh')
ON CONFLICT (slug) DO NOTHING;
