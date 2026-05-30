import type { AccountStatus, AuthUser, UserRole } from "@/types/logistics";

export const PUBLIC_REGISTER_ROLES: UserRole[] = ["customer", "dispatcher", "driver"];

export function accountStatusForRegistration(role: UserRole): AccountStatus {
  if (role === "dispatcher" || role === "driver") return "pending";
  return "approved";
}

export function isStaffRole(role: UserRole) {
  return role === "dispatcher" || role === "driver" || role === "admin";
}

export function canAccessDashboard(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.accountStatus === "approved";
}

export function accountStatusLabel(status: AccountStatus): string {
  const map: Record<AccountStatus, string> = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Từ chối"
  };
  return map[status] ?? status;
}

export function parseAccountStatus(value: unknown): AccountStatus {
  if (value === "pending" || value === "rejected") return value;
  return "approved";
}
