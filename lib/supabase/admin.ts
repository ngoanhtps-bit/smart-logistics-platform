import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";

/** Server-only admin client (bypass RLS). Requires SUPABASE_SERVICE_ROLE_KEY */
export function createSupabaseAdminClient() {
  const { url } = getSupabaseConfig();
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
