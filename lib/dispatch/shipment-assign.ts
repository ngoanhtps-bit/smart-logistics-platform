import { hasPendingOffer } from "@/lib/dispatch/offer-status";
import type { Shipment } from "@/types/logistics";

export function isUnassignedDriver(driver?: string) {
  return !driver || driver === "Chưa gán" || driver === "—";
}

export function isUnassignedVehicle(plate?: string) {
  return !plate || plate === "—";
}

/** Đã gửi app tài xế, đang chờ xác nhận */
export function shipmentWaitingDriver(s: Shipment) {
  return hasPendingOffer(s);
}

/** Đơn cần điều phối gán xe/tài xế (chưa gửi hoặc tài xế từ chối / chưa có tài xế) */
export function shipmentNeedsAssign(s: Shipment) {
  if (s.status === "delivered" || s.status === "cancelled") return false;
  if (hasPendingOffer(s)) return false;
  if (s.status === "draft" || s.status === "quoted") return true;
  if (s.offerStatus === "declined") return true;
  return isUnassignedDriver(s.driver) || isUnassignedVehicle(s.vehiclePlate);
}

export function canReassignShipment(s: Shipment) {
  return s.status !== "delivered" && s.status !== "cancelled";
}
