import type { AppNotification } from "@/lib/notifications-store";
import {
  isOperationalDbEnabled,
  supabaseCreateNotification,
  supabaseListNotifications,
  supabaseMarkAllNotificationsRead,
  supabaseMarkNotificationRead
} from "@/lib/supabase/operational-data";

export async function createAppNotification(input: {
  title: string;
  body: string;
  type?: AppNotification["type"];
  userId?: string | null;
  shipmentCode?: string;
}) {
  if (isOperationalDbEnabled()) {
    await supabaseCreateNotification({
      title: input.title,
      body: input.body,
      type: input.type,
      userId: input.userId,
      shipmentCode: input.shipmentCode
    });
  }
}

export async function fetchAppNotifications(userId?: string | null): Promise<AppNotification[] | null> {
  if (isOperationalDbEnabled()) {
    const rows = await supabaseListNotifications(userId);
    if (rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        body: r.body,
        type: (r.type as AppNotification["type"]) || "info",
        read: r.read,
        createdAt: r.created_at,
        shipmentCode: (r.shipment_code as string) ?? undefined
      }));
    }
  }
  return null;
}

export async function markAppNotificationRead(id: string) {
  if (isOperationalDbEnabled()) return supabaseMarkNotificationRead(id);
  return false;
}

export async function markAllAppNotificationsRead() {
  if (isOperationalDbEnabled()) return supabaseMarkAllNotificationsRead();
  return false;
}
