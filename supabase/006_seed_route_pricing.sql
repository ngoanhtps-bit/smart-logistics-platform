-- Bảng giá tuyến (cho báo giá thật từ DB)

INSERT INTO route_pricing (id, from_city, to_city, slug, container_20, container_40, transit_days, meta_title, meta_desc) VALUES
  ('rp1', 'Hà Nội', 'TP.HCM', 'ha-noi-sai-gon', '16.5 triệu', '18.5 triệu', '3-4 ngày', 'Hà Nội đi Sài Gòn', 'Container Bắc Nam'),
  ('rp2', 'Hải Phòng', 'Bình Dương', 'hai-phong-binh-duong', '18.2 triệu', '20.8 triệu', '3-5 ngày', 'Hải Phòng đi Bình Dương', 'Tuyến cảng KCN'),
  ('rp3', 'Bắc Ninh', 'Đồng Nai', 'bac-ninh-dong-nai', '17.1 triệu', '19.2 triệu', '3-4 ngày', 'Bắc Ninh đi Đồng Nai', 'KCN Bắc Nam')
ON CONFLICT (slug) DO NOTHING;
