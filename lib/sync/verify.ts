import { listShipmentEvents } from "@/lib/operations/shipment-events";
import { listShipments } from "@/lib/repositories/shipment.repository";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { hasPendingOffer } from "@/lib/dispatch/offer-status";
import { journeyStatusMessage } from "@/lib/shipment/workflow";

export async function buildSyncVerifySnapshot() {
  const shipments = await listShipments();
  const latest = shipments[0] ?? null;
  const events = await listShipmentEvents(undefined, 8);

  const pendingOffers = shipments.filter(hasPendingOffer).length;
  const active = shipments.filter((s) => !["delivered", "cancelled"].includes(s.status)).length;

  let eventsTableOk = true;
  let eventsTableDetail = "OK";
  if (getSupabaseConfig().enabled) {
    const client = createSupabaseAdminClient();
    if (client) {
      const { error } = await client.from("shipment_events").select("id").limit(1);
      if (error) {
        eventsTableOk = false;
        eventsTableDetail = error.message;
      }
    }
  }

  return {
    timestamp: new Date().toISOString(),
    shipmentCount: shipments.length,
    activeCount: active,
    pendingOfferCount: pendingOffers,
    latestShipment: latest
      ? {
          code: latest.code,
          status: latest.status,
          statusLabel: latest.statusLabel,
          offerStatus: latest.offerStatus ?? "none",
          driver: latest.driver,
          vehiclePlate: latest.vehiclePlate,
          journeyMessage: journeyStatusMessage(latest),
          updatedAt: latest.createdAt
        }
      : null,
    recentEvents: events,
    checks: [
      {
        id: "supabase",
        ok: getSupabaseConfig().enabled,
        label: "Supabase kết nối"
      },
      {
        id: "shipments",
        ok: shipments.length >= 0,
        label: `API vận đơn (${shipments.length} đơn)`
      },
      {
        id: "events",
        ok: eventsTableOk,
        label: eventsTableOk ? "Nhật ký sự kiện (020)" : `Thiếu 020: ${eventsTableDetail}`
      }
    ]
  };
}
