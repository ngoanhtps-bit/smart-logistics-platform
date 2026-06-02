import type { DriverOfferStatus, UserRole } from "@/types/logistics";

/** Màn làm việc chính theo vai trò — dùng cho thông báo & nút liên kết */
export function roleHomePath(role: UserRole) {
  switch (role) {
    case "dispatcher":
      return "/dispatcher";
    case "driver":
      return "/driver";
    case "customer":
      return "/customer";
    case "admin":
      return "/admin";
    default:
      return "/";
  }
}

export function dispatcherAssignUrl(code: string) {
  return `/dispatcher?tab=assign&assign=${encodeURIComponent(code)}`;
}

export function dispatcherControlUrl(code: string) {
  return `/dispatcher?tab=control&code=${encodeURIComponent(code)}`;
}

export function driverAppUrl(code?: string, tab: "pending" | "active" | "history" = "pending") {
  const q = new URLSearchParams({ tab });
  if (code) q.set("focus", code);
  return `/driver?${q.toString()}`;
}

export function driverTripUrl(code: string) {
  return `/driver/trip/${encodeURIComponent(code)}`;
}

export function customerOrderUrl(code: string) {
  return `/customer?tab=orders&code=${encodeURIComponent(code)}`;
}

export function trackingUrl(code: string) {
  return `/tracking/${encodeURIComponent(code)}`;
}

/** Đích ưu tiên khi bấm thông báo có mã đơn */
export function notificationWorkspaceUrl(
  role: UserRole | undefined,
  shipmentCode: string,
  hint?: { offerStatus?: DriverOfferStatus; title?: string }
) {
  if (!role) return trackingUrl(shipmentCode);

  const title = (hint?.title ?? "").toLowerCase();
  const pendingOffer =
    hint?.offerStatus === "pending" || title.includes("chốt") || title.includes("chuyến");

  if (role === "driver") {
    if (pendingOffer || title.includes("chốt")) return driverAppUrl(shipmentCode, "pending");
    if (title.includes("chạy") || title.includes("gán")) return driverAppUrl(shipmentCode, "active");
    return driverTripUrl(shipmentCode);
  }

  if (role === "dispatcher" || role === "admin") {
    if (pendingOffer || title.includes("chốt") || title.includes("từ chối")) {
      return dispatcherAssignUrl(shipmentCode);
    }
    if (title.includes("gán") || title.includes("mới")) return dispatcherAssignUrl(shipmentCode);
    return dispatcherControlUrl(shipmentCode);
  }

  if (role === "customer") {
    return customerOrderUrl(shipmentCode);
  }

  return trackingUrl(shipmentCode);
}
