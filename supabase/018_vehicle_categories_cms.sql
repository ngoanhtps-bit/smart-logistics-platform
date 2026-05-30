-- CMS loại xe — hiển thị trang chủ & trang /{slug}
-- Chạy sau 014_cms_blog.sql

CREATE TABLE IF NOT EXISTS vehicle_categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  image TEXT NOT NULL,
  capacity TEXT NOT NULL,
  cargo TEXT NOT NULL,
  size TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vehicle_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_vehicle_categories" ON vehicle_categories FOR SELECT USING (true);
CREATE POLICY "public_insert_vehicle_categories" ON vehicle_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_vehicle_categories" ON vehicle_categories FOR UPDATE USING (true);
CREATE POLICY "public_delete_vehicle_categories" ON vehicle_categories FOR DELETE USING (true);

INSERT INTO vehicle_categories (id, slug, title, image, capacity, cargo, size, sort_order, published) VALUES
  ('vc1', 'xe-container', 'Container 20FT',
   'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=900&q=80',
   '28 tấn', 'Hàng xuất nhập khẩu, pallet, máy móc', 'Dài 5.9m, rộng 2.35m, cao 2.39m', 1, true),
  ('vc2', 'xe-container-40ft', 'Container 40FT',
   'https://images.unsplash.com/photo-1494412685616-a5d310fbb07d?auto=format&fit=crop&w=900&q=80',
   '30 tấn', 'Hàng khối lượng lớn, hàng kho, hàng công nghiệp', 'Dài 12m, rộng 2.35m, cao 2.39m', 2, true),
  ('vc3', 'xe-tai-15-tan', 'Xe tải 15T',
   'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=900&q=80',
   '15 tấn', 'Hàng pallet, hàng nhà máy, hàng dự án', 'Thùng dài 9.6m', 3, true),
  ('vc4', 'xe-mooc-rao', 'Mooc rào',
   'https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=900&q=80',
   '32 tấn', 'Thép, máy công nghiệp, hàng quá khổ', 'Sàn 12.4m, có cột ràng buộc', 4, true),
  ('vc5', 'xe-mooc-san', 'Mooc sàn',
   'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=900&q=80',
   '34 tấn', 'Máy công trình, kết cấu, hàng nặng', 'Sàn phẳng 12.4m', 5, true),
  ('vc6', 'xe-tai-5-tan', 'Xe tải 5T',
   'https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62?auto=format&fit=crop&w=900&q=80',
   '5 tấn', 'Hàng nội thành, hàng lẻ, pallet nhỏ', 'Thùng dài 6.2m', 6, true)
ON CONFLICT (slug) DO NOTHING;
