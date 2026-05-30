import type { ShipmentStatus } from "@/types/logistics";

/** Đơn chưa chốt / lỗi — được phép xóa hàng loạt */
export const DELETABLE_SHIPMENT_STATUSES: ShipmentStatus[] = ["draft", "quoted", "cancelled"];

export function isDeletableShipmentStatus(status: ShipmentStatus) {
  return DELETABLE_SHIPMENT_STATUSES.includes(status);
}
