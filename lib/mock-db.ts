import type { FleetVehicle, QuoteRequest, QuoteResponse, Shipment, TrackingSnapshot } from "@/types/logistics";

const shipments: Shipment[] = [
  {
    code: "SPL-260528-01",
    route: "Hải Phòng → Bình Dương",
    pickup: "Cảng Hải Phòng",
    delivery: "KCN Bình Dương",
    driver: "Nguyễn Văn Hải",
    driverPhone: "0901 111 222",
    vehiclePlate: "51H-888.66",
    vehicleType: "Mooc rào",
    status: "in_transit",
    statusLabel: "Đang vận chuyển",
    eta: "29/05/2026 18:30",
    cargoType: "Pallet hàng kho",
    weight: "22 tấn",
    createdAt: "2026-05-28T08:00:00Z"
  },
  {
    code: "SPL-260528-02",
    route: "Bắc Ninh → Đồng Nai",
    pickup: "KCN Yên Phong",
    delivery: "KCN Long Thành",
    driver: "Trần Minh Đức",
    driverPhone: "0902 333 444",
    vehiclePlate: "15C-442.19",
    vehicleType: "Container 40FT",
    status: "loaded",
    statusLabel: "Đã xếp hàng",
    eta: "30/05/2026 09:00",
    cargoType: "Thiết bị công nghiệp",
    weight: "18 tấn",
    createdAt: "2026-05-28T09:30:00Z"
  },
  {
    code: "SPL-260528-03",
    route: "Hà Nội → TP.HCM",
    pickup: "Gia Lâm, Hà Nội",
    delivery: "KCN Hiệp Phước",
    driver: "Lê Quốc Nam",
    driverPhone: "0903 555 666",
    vehiclePlate: "29H-772.04",
    vehicleType: "Xe tải 15T",
    status: "pickup",
    statusLabel: "Đang lấy hàng",
    eta: "31/05/2026 11:15",
    cargoType: "Hàng điện tử",
    weight: "12 tấn",
    createdAt: "2026-05-28T10:15:00Z"
  }
];

const fleet: FleetVehicle[] = [
  { plate: "51H-888.66", type: "Mooc rào", driver: "Nguyễn Văn Hải", location: "QL1A - Quảng Ngãi", status: "Đang chạy", utilization: "91%", lat: 15.12, lng: 108.79 },
  { plate: "15C-442.19", type: "Container 40FT", driver: "Trần Minh Đức", location: "Cảng Hải Phòng", status: "Xe rỗng", utilization: "76%", lat: 20.86, lng: 106.68 },
  { plate: "29H-772.04", type: "Xe tải 15T", driver: "Lê Quốc Nam", location: "KCN Yên Phong", status: "Đang lấy hàng", utilization: "84%", lat: 21.20, lng: 106.00 },
  { plate: "60C-118.35", type: "Mooc sàn", driver: "Phạm Văn Tài", location: "Long Thành", status: "Bảo trì", utilization: "62%", lat: 10.76, lng: 106.95 }
];

const quotes: QuoteResponse[] = [];

function estimatePrice(req: QuoteRequest): QuoteResponse {
  const northSouth = /hà nội|hải phòng|bắc ninh/i.test(req.pickup) && /hcm|sài gòn|bình dương|đồng nai/i.test(req.delivery);
  const base = northSouth ? 18.5 : 10.5;
  const weightNum = parseFloat(req.weight) || 10;
  const surcharge = weightNum > 20 ? 2.5 : weightNum > 15 ? 1.5 : 0;
  const total = (base + surcharge).toFixed(1);

  const vehicle =
    /container.*40/i.test(req.vehicleType) ? "Container 40FT" :
    /mooc rào/i.test(req.vehicleType) ? "Mooc rào" :
    /mooc sàn/i.test(req.vehicleType) ? "Mooc sàn" :
    /15/i.test(req.vehicleType) ? "Xe tải 15T" : req.vehicleType;

  return {
    id: `QT-${Date.now()}`,
    estimatedPrice: `${total} triệu VND (tham khảo)`,
    suggestedVehicle: vehicle,
    transitDays: northSouth ? "3-4 ngày" : "1-2 ngày",
    eta: northSouth ? "31/05/2026" : "30/05/2026",
    message: "Điều phối sẽ xác nhận giá chính thức trong 12 phút."
  };
}

export type CreateShipmentInput = {
  pickup: string;
  delivery: string;
  cargoType: string;
  weight: string;
  dimensions?: string;
  vehicleType: string;
};

export type UpdateShipmentInput = {
  status?: Shipment["status"];
  driverName?: string;
  driverPhone?: string;
  vehiclePlate?: string;
  vehicleType?: string;
};

const statusLabelMap: Record<Shipment["status"], string> = {
  draft: "Nháp",
  quoted: "Đã báo giá",
  assigned: "Đã gán xe",
  pickup: "Đang lấy hàng",
  loaded: "Đã xếp hàng",
  in_transit: "Đang vận chuyển",
  delivered: "Đã giao",
  cancelled: "Đã huỷ"
};

function newCode() {
  const d = new Date();
  const y = String(d.getFullYear()).slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `SPL-${y}${m}${day}-${Math.floor(Math.random() * 900 + 100)}`;
}

export function createShipment(input: CreateShipmentInput): Shipment {
  const shipment: Shipment = {
    code: newCode(),
    route: `${input.pickup} → ${input.delivery}`,
    pickup: input.pickup,
    delivery: input.delivery,
    driver: "Chưa gán",
    driverPhone: "",
    vehiclePlate: "—",
    vehicleType: input.vehicleType,
    status: "quoted",
    statusLabel: statusLabelMap.quoted,
    eta: "Đang tính",
    cargoType: input.cargoType,
    weight: input.weight,
    createdAt: new Date().toISOString()
  };
  shipments.unshift(shipment);
  return shipment;
}

export function updateShipment(code: string, input: UpdateShipmentInput): Shipment | null {
  const idx = shipments.findIndex((s) => s.code === code);
  if (idx < 0) return null;
  const current = shipments[idx];
  const status = input.status ?? current.status;
  shipments[idx] = {
    ...current,
    status,
    statusLabel: statusLabelMap[status],
    driver: input.driverName ?? current.driver,
    driverPhone: input.driverPhone ?? current.driverPhone,
    vehiclePlate: input.vehiclePlate ?? current.vehiclePlate,
    vehicleType: input.vehicleType ?? current.vehicleType
  };
  return shipments[idx];
}

export function getShipments() {
  return [...shipments];
}

export function getShipment(code: string) {
  return shipments.find((s) => s.code === code);
}

export function getFleet() {
  return [...fleet];
}

export function createQuote(req: QuoteRequest): QuoteResponse {
  const quote = estimatePrice(req);
  quotes.push(quote);
  return quote;
}

export function getTracking(code: string): TrackingSnapshot | null {
  const shipment = getShipment(code);
  if (!shipment) return null;

  const baseLat = 16.0;
  const baseLng = 107.5;
  const now = new Date().toISOString();

  const history = Array.from({ length: 5 }).map((_, i) => ({
    latitude: baseLat + i * 0.4,
    longitude: baseLng + i * 0.3,
    speed: 62 - i * 3,
    timestamp: new Date(Date.now() - (5 - i) * 20_000).toISOString()
  }));

  const steps = ["Tạo đơn", "Gán tài xế", "Đã lấy hàng", "Đang vận chuyển", "Giao thành công"];
  const statusIndex =
    shipment.status === "delivered" ? 5 :
    shipment.status === "in_transit" ? 4 :
    shipment.status === "loaded" ? 3 :
    shipment.status === "pickup" ? 2 :
    shipment.status === "assigned" ? 1 : 0;

  return {
    code,
    shipment,
    current: history[history.length - 1],
    history,
    timeline: steps.map((step, i) => ({
      step,
      done: i < statusIndex,
      at: i < statusIndex ? now : undefined
    }))
  };
}
