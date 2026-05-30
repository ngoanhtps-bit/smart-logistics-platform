-- Supabase Storage: bucket chứng từ / POD
-- Nếu lệnh INSERT bucket lỗi (đã tồn tại), bỏ qua và chỉ chạy phần policies.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "documents_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

CREATE POLICY "documents_authenticated_upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "documents_authenticated_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documents');
