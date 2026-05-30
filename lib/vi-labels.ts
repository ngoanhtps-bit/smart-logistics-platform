/** Nhãn UI tiếng Việt dùng chung */

export const APP_NAME = "Nền tảng Logistics Thông minh";
export const APP_NAME_SHORT = "Logistics Thông minh";

export const marketplaceStatusLabels: Record<string, string> = {
  open: "Đang mở",
  bidding: "Đang đấu giá",
  assigned: "Đã gán chuyến",
  quoted: "Chờ gán xe",
  draft: "Nháp"
};

export function labelMarketplaceStatus(status: string) {
  return marketplaceStatusLabels[status] ?? status;
}

export const roleLabelsVi: Record<string, string> = {
  customer: "Khách hàng",
  dispatcher: "Điều phối",
  admin: "Quản trị",
  driver: "Tài xế"
};

export const shipmentStatusLabelsExtra: Record<string, string> = {
  quoted: "Chờ gán xe",
  in_transit: "Đang vận chuyển"
};
