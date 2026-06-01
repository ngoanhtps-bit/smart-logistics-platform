import type { DriverOfferStatus, Shipment } from "@/types/logistics";

export const offerStatusLabels: Record<DriverOfferStatus, string> = {
  none: "",
  pending: "Chờ tài xế chốt",
  accepted: "Tài xế đã chốt",
  declined: "Tài xế từ chối"
};

export function hasPendingOffer(s: Shipment) {
  return s.offerStatus === "pending";
}

export function hasDeclinedOffer(s: Shipment) {
  return s.offerStatus === "declined";
}

export function offerBadgeClass(status?: DriverOfferStatus) {
  switch (status) {
    case "pending":
      return "bg-violet-100 text-violet-900";
    case "accepted":
      return "bg-emerald-100 text-emerald-800";
    case "declined":
      return "bg-red-100 text-red-800";
    default:
      return "";
  }
}
