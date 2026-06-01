import { hasPendingOffer } from "@/lib/dispatch/offer-status";
import type { FleetVehicle, RegisteredDriver, Shipment } from "@/types/logistics";

export type DriverSuggestion = RegisteredDriver & {
  score: number;
  reasons: string[];
  busy: boolean;
};

function norm(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ");
}

function vehicleTypeMatch(shipmentType: string, driverType: string) {
  const a = norm(shipmentType);
  const b = norm(driverType);
  if (!a || !b) return false;
  const keys = ["container", "mooc", "tải", "truck", "5t", "15t", "40", "20"];
  return keys.some((k) => a.includes(k) && b.includes(k));
}

function driverHasActiveTrip(d: RegisteredDriver, shipments: Shipment[]) {
  return shipments.some(
    (s) =>
      s.offerStatus === "accepted" &&
      (s.driver === d.name || s.driver.startsWith(`${d.name} `)) &&
      !["delivered", "cancelled"].includes(s.status)
  );
}

function driverPendingElsewhere(d: RegisteredDriver, skipCode: string, shipments: Shipment[]) {
  return shipments.some(
    (s) => s.code !== skipCode && hasPendingOffer(s) && s.targetDriverId === d.driverId
  );
}

export function rankDriversForShipment(
  shipment: Shipment,
  drivers: RegisteredDriver[],
  fleet: FleetVehicle[],
  allShipments: Shipment[]
): DriverSuggestion[] {
  const suggestions: DriverSuggestion[] = drivers.map((d) => {
    let score = 0;
    const reasons: string[] = [];
    const busy = driverHasActiveTrip(d, allShipments);

    if (!busy) {
      score += 40;
      reasons.push("Đang rảnh");
    } else {
      score -= 35;
      reasons.push("Đang có chuyến active");
    }

    if (d.vehicleType && vehicleTypeMatch(shipment.vehicleType, d.vehicleType)) {
      score += 25;
      reasons.push("Loại xe phù hợp");
    }

    const fleetMatch = fleet.find(
      (v) =>
        v.plate === d.plate &&
        (v.status.toLowerCase().includes("available") || v.status.includes("rỗng"))
    );
    if (fleetMatch) {
      score += 20;
      reasons.push("Xe rỗi trong đội");
    } else if (d.plate) {
      score += 8;
      reasons.push("Có BSX đăng ký");
    }

    if (d.phone) {
      score += 5;
    }

    const pendingElsewhere = driverPendingElsewhere(d, shipment.code, allShipments);
    if (pendingElsewhere) {
      score -= 50;
      reasons.push("Đang chờ chốt đơn khác");
    }

    return { ...d, score, reasons, busy };
  });

  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .filter((s) => s.score > -20);
}
