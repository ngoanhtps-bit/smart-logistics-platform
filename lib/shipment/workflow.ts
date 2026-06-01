import { hasPendingOffer } from "@/lib/dispatch/offer-status";
import { isUnassignedDriver } from "@/lib/dispatch/shipment-assign";
import { statusLabels } from "@/lib/status-labels";
import type { Shipment, ShipmentOpsEvent, ShipmentStatus, UserRole } from "@/types/logistics";

export type JourneyStepId =
  | "created"
  | "dispatch"
  | "driver_confirm"
  | "pickup"
  | "transit"
  | "delivered";

export type JourneyStep = {
  id: JourneyStepId;
  label: string;
  done: boolean;
  current: boolean;
  detail?: string;
  at?: string;
};

export type JourneyAction = {
  label: string;
  href: string;
  description?: string;
  primary?: boolean;
};

const statusOrder: ShipmentStatus[] = [
  "draft",
  "quoted",
  "assigned",
  "pickup",
  "loaded",
  "in_transit",
  "delivered",
  "cancelled"
];

export function shipmentProgressPercent(shipment: Shipment) {
  const idx = statusOrder.indexOf(shipment.status);
  if (shipment.status === "cancelled") return 0;
  if (idx < 0) return 0;
  return Math.round((idx / (statusOrder.length - 2)) * 100);
}

export function buildJourneySteps(shipment: Shipment, events?: ShipmentOpsEvent[]): JourneyStep[] {
  const eventByType = new Map(events?.map((e) => [e.eventType, e]) ?? []);

  const created = eventByType.get("created");
  const offered = eventByType.get("offer_sent");
  const accepted = eventByType.get("driver_accepted");
  const declined = eventByType.get("driver_declined");

  const dispatchDone =
    !isUnassignedDriver(shipment.driver) ||
    hasPendingOffer(shipment) ||
    shipment.offerStatus === "accepted" ||
    Boolean(accepted);
  const driverDone =
    shipment.offerStatus === "accepted" ||
    (!hasPendingOffer(shipment) && !isUnassignedDriver(shipment.driver) && shipment.status !== "quoted");
  const pickupDone = ["pickup", "loaded", "in_transit", "delivered"].includes(shipment.status);
  const transitDone = ["in_transit", "delivered"].includes(shipment.status);
  const deliveredDone = shipment.status === "delivered";

  const steps: JourneyStep[] = [
    {
      id: "created",
      label: "Đặt đơn",
      done: true,
      current: shipment.status === "draft" || shipment.status === "quoted",
      detail: shipment.route,
      at: created?.createdAt
    },
    {
      id: "dispatch",
      label: "Điều phối gán",
      done: dispatchDone,
      current: hasPendingOffer(shipment) || (shipment.status === "quoted" && !driverDone),
      detail: hasPendingOffer(shipment)
        ? "Chờ tài xế chốt trên app"
        : declined
          ? "Tài xế từ chối — gán lại"
          : isUnassignedDriver(shipment.driver)
            ? "Chưa gán tài xế"
            : shipment.driver,
      at: offered?.createdAt ?? accepted?.createdAt
    },
    {
      id: "driver_confirm",
      label: "Tài xế chốt",
      done: driverDone,
      current: hasPendingOffer(shipment),
      detail: shipment.driverReportPlate
        ? `BSX ${shipment.driverReportPlate}`
        : shipment.offerStatus === "declined"
          ? "Đã từ chối"
          : undefined,
      at: accepted?.createdAt ?? declined?.createdAt
    },
    {
      id: "pickup",
      label: "Lấy & xếp hàng",
      done: pickupDone,
      current: shipment.status === "assigned" || shipment.status === "pickup" || shipment.status === "loaded",
      detail: statusLabels.pickup,
      at: undefined
    },
    {
      id: "transit",
      label: "Vận chuyển",
      done: transitDone,
      current: shipment.status === "in_transit",
      detail: statusLabels.in_transit,
      at: undefined
    },
    {
      id: "delivered",
      label: "Giao hàng",
      done: deliveredDone,
      current: false,
      detail: deliveredDone ? "Hoàn tất" : shipment.eta,
      at: undefined
    }
  ];

  if (shipment.status === "cancelled") {
    return steps.map((s) => ({ ...s, current: false, done: s.id === "created" }));
  }

  const firstIncomplete = steps.findIndex((s) => !s.done);
  if (firstIncomplete >= 0) {
    return steps.map((s, i) => ({
      ...s,
      current: i === firstIncomplete && !s.done
    }));
  }
  return steps;
}

export function getJourneyActions(shipment: Shipment, role?: UserRole | null): JourneyAction[] {
  const code = shipment.code;
  const enc = encodeURIComponent(code);
  const actions: JourneyAction[] = [
    { label: "Theo dõi GPS", href: `/tracking/${code}`, description: "Bản đồ & timeline", primary: true }
  ];

  if (!role) return actions;

  if (role === "customer") {
    if (shipment.status === "quoted" || isUnassignedDriver(shipment.driver)) {
      actions.unshift({
        label: "Đang chờ điều phối",
        href: `/tracking/${code}`,
        description: "Đơn đã gửi — điều phối sẽ gán xe sớm"
      });
    }
    return actions;
  }

  if (role === "dispatcher" || role === "admin") {
    actions.unshift({
      label: hasPendingOffer(shipment) ? "Xem chờ chốt" : "Gán / điều khiển",
      href: `/dispatcher?assign=${enc}`,
      description: "Trung tâm gán xe",
      primary: !hasPendingOffer(shipment)
    });
    actions.push({
      label: "Điều khiển vận hành",
      href: `/dispatcher`,
      description: "Tab Điều khiển"
    });
  }

  if (role === "driver" || role === "admin") {
    if (hasPendingOffer(shipment) || shipment.offerStatus === "accepted") {
      actions.unshift({
        label: "App tài xế",
        href: "/driver",
        description: hasPendingOffer(shipment) ? "Chốt chuyến" : "Cập nhật trạng thái",
        primary: role === "driver"
      });
    }
  }

  return actions.slice(0, 4);
}

export function journeyStatusMessage(shipment: Shipment) {
  if (shipment.status === "cancelled") return "Đơn đã hủy.";
  if (hasPendingOffer(shipment)) return "Điều phối đã gửi — đang chờ tài xế xác nhận trên app.";
  if (shipment.offerStatus === "declined") return "Tài xế từ chối — điều phối cần gán tài xế khác.";
  if (shipment.status === "delivered") return "Đã giao hàng thành công.";
  if (shipment.status === "in_transit") return "Hàng đang trên đường giao.";
  if (isUnassignedDriver(shipment.driver) && shipment.status === "quoted") {
    return "Đơn mới — điều phối sẽ gán xe và gửi tài xế chốt.";
  }
  if (!isUnassignedDriver(shipment.driver)) {
    return `${shipment.driver} · ${shipment.vehiclePlate} — ${shipment.statusLabel}`;
  }
  return shipment.statusLabel;
}
