import { hasPendingOffer } from "@/lib/dispatch/offer-status";
import { shipmentNeedsAssign, shipmentWaitingDriver } from "@/lib/dispatch/shipment-assign";
import type { Shipment } from "@/types/logistics";

export const OFFER_SLA_MINUTES = 30;
export const ASSIGN_SLA_HOURS = 4;

export type SlaLevel = "ok" | "warn" | "critical";

export type SlaInfo = {
  level: SlaLevel;
  priority: number;
  label: string;
  minutesWaiting?: number;
};

function minutesSince(iso?: string) {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.max(0, Math.round((Date.now() - t) / 60_000));
}

export function getShipmentSlaInfo(s: Shipment): SlaInfo {
  const updated = s.updatedAt ?? s.createdAt;
  const mins = minutesSince(updated);

  if (hasPendingOffer(s)) {
    if (mins >= OFFER_SLA_MINUTES) {
      return {
        level: "critical",
        priority: 1000 + mins,
        label: `Chờ chốt ${mins}p (quá ${OFFER_SLA_MINUTES}p)`,
        minutesWaiting: mins
      };
    }
    if (mins >= 15) {
      return {
        level: "warn",
        priority: 500 + mins,
        label: `Chờ chốt ${mins}p`,
        minutesWaiting: mins
      };
    }
    return {
      level: "ok",
      priority: 100 + mins,
      label: `Chờ chốt ${mins}p`,
      minutesWaiting: mins
    };
  }

  if (s.offerStatus === "declined") {
    return {
      level: "critical",
      priority: 900 + mins,
      label: "Tài xế từ chối — gán lại",
      minutesWaiting: mins
    };
  }

  if (shipmentNeedsAssign(s)) {
    const hours = mins / 60;
    if (hours >= ASSIGN_SLA_HOURS) {
      return {
        level: "critical",
        priority: 800 + mins,
        label: `Chưa gán ${Math.round(hours)}h`,
        minutesWaiting: mins
      };
    }
    if (mins >= 60) {
      return {
        level: "warn",
        priority: 400 + mins,
        label: `Chưa gán ${mins}p`,
        minutesWaiting: mins
      };
    }
    return { level: "ok", priority: 50 + mins, label: "Chờ gán", minutesWaiting: mins };
  }

  if (shipmentWaitingDriver(s)) {
    return getShipmentSlaInfo({ ...s, offerStatus: "pending" });
  }

  if (s.status === "in_transit" && mins >= 24 * 60) {
    return {
      level: "warn",
      priority: 300 + mins,
      label: "Đang chạy lâu",
      minutesWaiting: mins
    };
  }

  return { level: "ok", priority: mins, label: "", minutesWaiting: mins };
}

export function sortShipmentsBySla(shipments: Shipment[]): Shipment[] {
  return [...shipments].sort((a, b) => getShipmentSlaInfo(b).priority - getShipmentSlaInfo(a).priority);
}
