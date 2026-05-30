import { resolveAuthUser } from "@/lib/auth/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { AuthUser, UserRole } from "@/types/logistics";

export async function getSessionUser(): Promise<AuthUser | null> {
  if (!getSupabaseConfig().enabled) return null;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  return resolveAuthUser(user);
}

export function requireRole(user: AuthUser | null, roles: UserRole[]): AuthUser | null {
  if (!user || !roles.includes(user.role)) return null;
  return user;
}
