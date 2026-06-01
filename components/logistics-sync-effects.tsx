"use client";

import { useAuthStore } from "@/store/auth";
import { useDispatcherOpsAlerts } from "@/hooks/use-dispatcher-ops-alerts";

/** Cảnh báo vận hành theo vai trò (Realtime đơn chạy ở SyncStatusBadge) */
export function LogisticsSyncEffects() {
  const role = useAuthStore((s) => s.user?.role);
  useDispatcherOpsAlerts(role === "dispatcher" || role === "admin");
  return null;
}
