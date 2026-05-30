import type { Shipment } from "@/types/logistics";

export function isUnassignedDriver(driver?: string) {
  return !driver || driver === "Chưa gán" || driver === "—";
}

export function isUnassignedVehicle(plate?: string) {
  return !plate || plate === "—";
}

/** Đơn cần điều phối gán xe/tài xế */
export function shipmentNeedsAssign(s: Shipment) {
  if (s.status === "delivered" || s.status === "cancelled") return false;
  if (s.status === "draft" || s.status === "quoted") return true;
  return isUnassignedDriver(s.driver) || isUnassignedVehicle(s.vehiclePlate);
}

export function canReassignShipment(s: Shipment) {
  return s.status !== "delivered" && s.status !== "cancelled";
}
