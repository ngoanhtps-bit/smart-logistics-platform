-- Blog CMS (chạy sau 002)

CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Logistics',
  read_time TEXT DEFAULT '5 phút',
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_blog" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "public_insert_blog" ON blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_blog" ON blog_posts FOR UPDATE USING (true);
CREATE POLICY "public_delete_blog" ON blog_posts FOR DELETE USING (true);

INSERT INTO blog_posts (id, slug, title, excerpt, content, category, read_time, published) VALUES
  ('bp1', 'van-chuyen-container-bac-nam-2026', 'Vận chuyển container Bắc Nam 2026: bảng giá và lưu ý',
   'Cập nhật giá container 20FT/40FT, thời gian transit và cách chọn xe phù hợp.',
   'Nội dung chi tiết về vận chuyển container Bắc Trung Nam năm 2026. Liên hệ điều phối để nhận báo giá theo tuyến và loại xe.',
   'Container', '8 phút', true),
  ('bp2', 'xe-mooc-rao-cho-thep-va-hang-nang', 'Xe mooc rào cho thép và hàng nặng: quy trình an toàn',
   'Hướng dẫn ràng buộc hàng, hồ sơ xe và điểm bốc xếp cho hàng quá khổ.',
   'Quy trình vận chuyển thép và hàng nặng bằng mooc rào, lưu ý an toàn và chứng từ.',
   'Mooc rào', '6 phút', true)
ON CONFLICT (slug) DO NOTHING;
