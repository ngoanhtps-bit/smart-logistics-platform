import { NextResponse } from "next/server";
import { canAccessDashboard } from "@/lib/auth/account-status";
import { getSessionUser, requireRole } from "@/lib/auth/session";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { UserRole } from "@/types/logistics";

export async function requireApiRoles(roles: UserRole[]) {
  if (!getSupabaseConfig().enabled) {
    return { user: null as null, error: null as null };
  }

  const user = await getSessionUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ message: "Vui lòng đăng nhập" }, { status: 401 })
    };
  }

  if (!canAccessDashboard(user)) {
    return {
      user: null,
      error: NextResponse.json(
        { message: "Tài khoản chưa được admin duyệt. Vui lòng chờ phê duyệt." },
        { status: 403 }
      )
    };
  }

  const allowed = requireRole(user, roles);
  if (!allowed) {
    return {
      user: null,
      error: NextResponse.json({ message: "Không có quyền thực hiện" }, { status: 403 })
    };
  }

  return { user: allowed, error: null };
}

export const dispatcherRoles: UserRole[] = ["dispatcher", "admin"];
export const driverRoles: UserRole[] = ["driver", "admin"];
export const customerRoles: UserRole[] = ["customer", "admin"];
