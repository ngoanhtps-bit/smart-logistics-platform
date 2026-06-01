import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { ShipmentEventType, ShipmentOpsEvent } from "@/types/logistics";

export type LogEventInput = {
  shipmentCode: string;
  eventType: ShipmentEventType;
  message: string;
  actorUserId?: string | null;
  actorRole?: string | null;
  meta?: Record<string, unknown>;
};

export async function logShipmentEvent(input: LogEventInput) {
  if (!getSupabaseConfig().enabled) return;
  const client = createSupabaseAdminClient();
  if (!client) return;

  await client.from("shipment_events").insert({
    id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    shipment_code: input.shipmentCode,
    event_type: input.eventType,
    message: input.message,
    actor_user_id: input.actorUserId ?? null,
    actor_role: input.actorRole ?? null,
    meta: input.meta ?? {}
  });
}

export async function listShipmentEvents(shipmentCode?: string, limit = 40): Promise<ShipmentOpsEvent[]> {
  if (!getSupabaseConfig().enabled) return [];
  const client = createSupabaseAdminClient();
  if (!client) return [];

  let query = client
    .from("shipment_events")
    .select("id, shipment_code, event_type, message, actor_user_id, actor_role, meta, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (shipmentCode) query = query.eq("shipment_code", shipmentCode);

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as string,
    shipmentCode: row.shipment_code as string,
    eventType: row.event_type as ShipmentEventType,
    message: row.message as string,
    actorUserId: (row.actor_user_id as string) ?? undefined,
    actorRole: (row.actor_role as string) ?? undefined,
    meta: (row.meta as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string
  }));
}

export const eventTypeLabels: Record<ShipmentEventType, string> = {
  created: "Tạo đơn",
  offer_sent: "Gửi chốt app",
  offer_cancelled: "Hủy gửi chuyến",
  driver_accepted: "Tài xế chốt",
  driver_declined: "Tài xế từ chối",
  assigned: "Gán trực tiếp",
  status_changed: "Đổi trạng thái",
  note: "Ghi chú",
  cancelled: "Hủy đơn"
};
