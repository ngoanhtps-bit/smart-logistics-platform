import type { ShipmentStatus } from "@/types/logistics";

export const statusLabels: Record<ShipmentStatus, string> = {
  draft: "Nháp",
  quoted: "Đã báo giá",
  assigned: "Đã gán xe",
  pickup: "Đang lấy hàng",
  loaded: "Đã xếp hàng",
  in_transit: "Đang vận chuyển",
  delivered: "Đã giao",
  cancelled: "Đã huỷ"
};
