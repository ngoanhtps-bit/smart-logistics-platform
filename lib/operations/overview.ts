import { hasDeclinedOffer, hasPendingOffer } from "@/lib/dispatch/offer-status";
import { shipmentNeedsAssign, shipmentWaitingDriver } from "@/lib/dispatch/shipment-assign";
import type { Shipment, ShipmentOpsAlert, ShipmentOpsOverview } from "@/types/logistics";

export function buildOperationsOverview(shipments: Shipment[]): ShipmentOpsOverview {
  const active = shipments.filter((s) => !["delivered", "cancelled"].includes(s.status));
  const waitingDriver = shipments.filter(shipmentWaitingDriver);
  const needsAssign = shipments.filter(shipmentNeedsAssign);
  const pendingOffer = shipments.filter(hasPendingOffer);
  const declined = shipments.filter(hasDeclinedOffer);
  const inTransit = shipments.filter((s) => s.status === "in_transit");
  const delivered = shipments.filter((s) => s.status === "delivered");

  const alerts: ShipmentOpsAlert[] = [];

  for (const s of waitingDriver.slice(0, 5)) {
    alerts.push({
      level: "warning",
      code: s.code,
      message: `${s.code}: đang chờ tài xế chốt trên app`,
      href: `/dispatcher?assign=${encodeURIComponent(s.code)}`
    });
  }
  for (const s of declined.slice(0, 3)) {
    alerts.push({
      level: "error",
      code: s.code,
      message: `${s.code}: tài xế từ chối — cần gán lại`,
      href: `/dispatcher?assign=${encodeURIComponent(s.code)}`
    });
  }
  for (const s of needsAssign.filter((x) => !hasPendingOffer(x)).slice(0, 3)) {
    alerts.push({
      level: "info",
      code: s.code,
      message: `${s.code}: chưa có tài xế / biển số`,
      href: `/dispatcher?assign=${encodeURIComponent(s.code)}`
    });
  }

  return {
    counts: {
      total: shipments.length,
      active: active.length,
      waitingDriver: waitingDriver.length,
      needsAssign: needsAssign.length,
      pendingOffer: pendingOffer.length,
      inTransit: inTransit.length,
      delivered: delivered.length,
      declined: declined.length
    },
    alerts
  };
}
