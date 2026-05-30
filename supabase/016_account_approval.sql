-- Duyệt tài khoản điều phối / tài xế đăng ký công khai
-- Chạy sau 009 (trigger sync user)

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'approved';

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_account_status_check;
ALTER TABLE public.users
  ADD CONSTRAINT users_account_status_check
  CHECK (account_status IN ('pending', 'approved', 'rejected'));

UPDATE public.users SET account_status = 'approved' WHERE account_status IS NULL;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  req_role text;
  req_status text;
BEGIN
  req_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
  req_status := COALESCE(
    NEW.raw_user_meta_data->>'account_status',
    CASE WHEN req_role IN ('dispatcher', 'driver') THEN 'pending' ELSE 'approved' END
  );

  INSERT INTO public.users (id, email, name, role, password, phone, account_status)
  VALUES (
    NEW.id::text,
    lower(NEW.email),
    COALESCE(
      NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''),
      split_part(NEW.email, '@', 1)
    ),
    req_role::public.user_role,
    'supabase-auth',
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    req_status
  )
  ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
    name = COALESCE(NULLIF(EXCLUDED.name, ''), public.users.name),
    phone = COALESCE(EXCLUDED.phone, public.users.phone),
    role = EXCLUDED.role,
    account_status = EXCLUDED.account_status,
    password = 'supabase-auth';
  RETURN NEW;
END;
$$;
