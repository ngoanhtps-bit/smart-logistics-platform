-- Chạy sau 002_rls_policies.sql
-- Cho phép user đã đăng nhập cập nhật profile của chính mình (id = auth.uid()::text)

CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);
