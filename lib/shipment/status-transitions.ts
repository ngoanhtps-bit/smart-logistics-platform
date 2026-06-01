import type { ShipmentStatus } from "@/types/logistics";

const forwardOrder: ShipmentStatus[] = [
  "draft",
  "quoted",
  "assigned",
  "pickup",
  "loaded",
  "in_transit",
  "delivered"
];

const allowed: Record<ShipmentStatus, ShipmentStatus[]> = {
  draft: ["quoted", "assigned", "cancelled"],
  quoted: ["assigned", "cancelled"],
  assigned: ["pickup", "loaded", "in_transit", "delivered", "cancelled"],
  pickup: ["loaded", "in_transit", "delivered", "cancelled"],
  loaded: ["in_transit", "delivered", "cancelled"],
  in_transit: ["delivered", "cancelled"],
  delivered: [],
  cancelled: []
};

/** Cho phép nhảy 1 bước tiến hoặc lùi tối đa 1 bước (điều phối sửa) */
export function canTransitionStatus(from: ShipmentStatus, to: ShipmentStatus): boolean {
  if (from === to) return true;
  if (to === "cancelled") return from !== "delivered";
  if (from === "cancelled" || from === "delivered") return false;
  if (allowed[from]?.includes(to)) return true;

  const fromIdx = forwardOrder.indexOf(from);
  const toIdx = forwardOrder.indexOf(to);
  if (fromIdx < 0 || toIdx < 0) return false;
  return Math.abs(toIdx - fromIdx) <= 1;
}

export function assertStatusTransition(from: ShipmentStatus, to: ShipmentStatus) {
  if (!canTransitionStatus(from, to)) {
    throw new Error(
      `Không thể đổi trạng thái từ «${from}» sang «${to}». Chỉ chuyển tuần tự hoặc hủy đơn.`
    );
  }
}
