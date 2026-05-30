import {
  createQuote as mockCreateQuote,
  createShipment as mockCreateShipment,
  getFleet as mockGetFleet,
  getShipment as mockGetShipment,
  getShipments as mockGetShipments,
  getTracking as mockGetTracking,
  updateShipment as mockUpdateShipment
} from "@/lib/mock-db";
import { isDatabaseEnabled, prisma } from "@/lib/db";
import { isDeletableShipmentStatus } from "@/lib/shipments/deletable-status";
import {
  isSupabaseDataEnabled,
  supabaseAppendTracking,
  supabaseCreateQuote,
  supabaseCreateShipment,
  supabaseDeleteShipments,
  supabaseFindShipment,
  supabaseGetTracking,
  supabaseListFleet,
  supabaseGetDriverIdForUser,
  supabaseListShipments,
  supabasePatchShipment
} from "@/lib/supabase/data-access";

function prefersSupabase() {
  return isSupabaseDataEnabled();
}
import { statusLabels } from "@/lib/status-labels";
import type {
  FleetVehicle,
  QuoteRequest,
  QuoteResponse,
  Shipment,
  ShipmentStatus,
  TrackingSnapshot
} from "@/types/logistics";
import type { Shipment as PrismaShipment, ShipmentStatus as PrismaStatus } from "@prisma/client";

export type CreateShipmentInput = {
  pickup: string;
  delivery: string;
  cargoType: string;
  weight: string;
  dimensions?: string;
  vehicleType: string;
  customerEmail?: string;
};

export type UpdateShipmentInput = {
  status?: ShipmentStatus;
  driverName?: string;
  driverPhone?: string;
  vehiclePlate?: string;
  vehicleType?: string;
};

function formatEta(date?: Date | null) {
  if (!date) return "Đang cập nhật";
  return date.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
}

function mapPrismaShipment(row: PrismaShipment & {
  driver?: { user: { name: string; phone: string | null } } | null;
  vehicle?: { plateNumber: string; type: string } | null;
}): Shipment {
  const status = row.status as ShipmentStatus;
  return {
    code: row.code,
    route: `${row.pickupLocation} → ${row.deliveryLocation}`,
    pickup: row.pickupLocation,
    delivery: row.deliveryLocation,
    driver: row.driver?.user.name ?? "Chưa gán",
    driverPhone: row.driver?.user.phone ?? "",
    vehiclePlate: row.vehicle?.plateNumber ?? "—",
    vehicleType: row.vehicleType ?? row.vehicle?.type ?? "—",
    status,
    statusLabel: statusLabels[status] ?? row.status,
    eta: formatEta(row.eta),
    cargoType: row.cargoType,
    weight: row.weight ?? "",
    createdAt: row.createdAt.toISOString()
  };
}

async function getDemoCustomerId() {
  const user = await prisma.user.findFirst({ where: { email: "customer@demo.vn" } });
  if (user) return user.id;
  const created = await prisma.user.create({
    data: {
      email: "customer@demo.vn",
      name: "Khách hàng Demo",
      role: "customer",
      password: "hashed-demo",
      phone: "0901000001"
    }
  });
  return created.id;
}

function generateCode() {
  const d = new Date();
  const y = String(d.getFullYear()).slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 900 + 100);
  return `SPL-${y}${m}${day}-${rand}`;
}

export type ShipmentListFilters = { customerId?: string; driverId?: string };

export async function listShipments(filters?: ShipmentListFilters): Promise<Shipment[]> {
  if (prefersSupabase()) return supabaseListShipments(filters);
  if (!isDatabaseEnabled()) return mockGetShipments();
  try {
    const rows = await prisma.shipment.findMany({
      orderBy: { createdAt: "desc" },
      include: { driver: { include: { user: true } }, vehicle: true }
    });
    return rows.map(mapPrismaShipment);
  } catch {
    if (prefersSupabase()) return supabaseListShipments();
    return mockGetShipments();
  }
}

export async function deleteShipments(codes: string[]) {
  if (prefersSupabase()) return supabaseDeleteShipments(codes);
  if (!isDatabaseEnabled()) {
    return { deleted: 0, codes: [] as string[], skipped: codes };
  }
  try {
    const rows = await prisma.shipment.findMany({
      where: { code: { in: codes } },
      select: { id: true, code: true, status: true }
    });
    const deletable = rows.filter((r) => isDeletableShipmentStatus(r.status as ShipmentStatus));
    const skipped = codes.filter(
      (c) => !deletable.some((r) => r.code === c)
    );
    for (const row of deletable) {
      await prisma.shipmentTracking.deleteMany({ where: { shipmentId: row.id } });
      await prisma.shipment.delete({ where: { id: row.id } });
    }
    return {
      deleted: deletable.length,
      codes: deletable.map((r) => r.code),
      skipped
    };
  } catch (e) {
    throw new Error((e as Error).message);
  }
}

export async function findShipment(code: string): Promise<Shipment | null> {
  if (prefersSupabase()) return supabaseFindShipment(code);
  if (!isDatabaseEnabled()) return mockGetShipment(code) ?? null;
  try {
    const row = await prisma.shipment.findUnique({
      where: { code },
      include: { driver: { include: { user: true } }, vehicle: true }
    });
    return row ? mapPrismaShipment(row) : null;
  } catch {
    if (prefersSupabase()) return supabaseFindShipment(code);
    return mockGetShipment(code) ?? null;
  }
}

export async function createShipment(input: CreateShipmentInput, customerId?: string): Promise<Shipment> {
  if (prefersSupabase()) {
    const created = await supabaseCreateShipment(input, customerId);
    if (created) return created;
    throw new Error("Không tạo được đơn trên Supabase");
  }
  if (!isDatabaseEnabled()) return mockCreateShipment(input);
  try {
    const customerId = await getDemoCustomerId();
    const code = generateCode();
    const row = await prisma.shipment.create({
      data: {
        code,
        customerId,
        pickupLocation: input.pickup,
        deliveryLocation: input.delivery,
        cargoType: input.cargoType,
        weight: input.weight,
        dimensions: input.dimensions,
        vehicleType: input.vehicleType,
        status: "quoted",
        eta: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },
      include: { driver: { include: { user: true } }, vehicle: true }
    });
    return mapPrismaShipment(row);
  } catch {
    return mockCreateShipment(input);
  }
}

export async function resolveDriverIdForUser(userId: string): Promise<string | null> {
  if (prefersSupabase()) return supabaseGetDriverIdForUser(userId);
  return null;
}

export async function patchShipment(code: string, input: UpdateShipmentInput): Promise<Shipment | null> {
  if (prefersSupabase()) {
    return supabasePatchShipment(code, {
      status: input.status,
      vehicleType: input.vehicleType,
      driverName: input.driverName,
      driverPhone: input.driverPhone,
      vehiclePlate: input.vehiclePlate
    });
  }
  if (!isDatabaseEnabled()) return mockUpdateShipment(code, input);
  try {
    const existing = await prisma.shipment.findUnique({ where: { code } });
    if (!existing) return null;

    let driverId = existing.driverId;
    let vehicleId = existing.vehicleId;

    if (input.vehiclePlate) {
      const vehicle = await prisma.vehicle.upsert({
        where: { plateNumber: input.vehiclePlate },
        update: { type: input.vehicleType ?? undefined, status: "busy" },
        create: {
          plateNumber: input.vehiclePlate,
          type: input.vehicleType ?? "Xe tải",
          status: "busy"
        }
      });
      vehicleId = vehicle.id;
    }

    if (input.driverName) {
      const email = `driver-${input.driverName.replace(/\s/g, "").toLowerCase()}@fleet.local`;
      const user = await prisma.user.upsert({
        where: { email },
        update: { name: input.driverName, phone: input.driverPhone },
        create: {
          email,
          name: input.driverName,
          phone: input.driverPhone,
          role: "driver",
          password: "hashed"
        }
      });
      const driver = await prisma.driver.upsert({
        where: { userId: user.id },
        update: { vehicleId: vehicleId ?? undefined },
        create: { userId: user.id, licenseNumber: "GPLX-DEMO", vehicleId: vehicleId ?? undefined }
      });
      driverId = driver.id;
    }

    const row = await prisma.shipment.update({
      where: { code },
      data: {
        status: (input.status as PrismaStatus) ?? undefined,
        driverId,
        vehicleId,
        vehicleType: input.vehicleType
      },
      include: { driver: { include: { user: true } }, vehicle: true }
    });
    return mapPrismaShipment(row);
  } catch {
    return mockUpdateShipment(code, input);
  }
}

export async function getTrackingSnapshot(code: string): Promise<TrackingSnapshot | null> {
  if (prefersSupabase()) return supabaseGetTracking(code);
  if (!isDatabaseEnabled()) return mockGetTracking(code);
  try {
    const shipment = await findShipment(code);
    if (!shipment) return null;
    const points = await prisma.shipmentTracking.findMany({
      where: { shipment: { code } },
      orderBy: { timestamp: "asc" },
      take: 20
    });
    if (points.length === 0) return mockGetTracking(code);

    const current = points[points.length - 1];
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
      current: {
        latitude: current.latitude,
        longitude: current.longitude,
        speed: current.speed ?? 60,
        timestamp: current.timestamp.toISOString()
      },
      history: points.map((p) => ({
        latitude: p.latitude,
        longitude: p.longitude,
        speed: p.speed ?? 0,
        timestamp: p.timestamp.toISOString()
      })),
      timeline: steps.map((step, i) => ({
        step,
        done: i < statusIndex,
        at: i < statusIndex ? current.timestamp.toISOString() : undefined
      }))
    };
  } catch {
    return mockGetTracking(code);
  }
}

export async function listFleet(): Promise<FleetVehicle[]> {
  if (prefersSupabase()) return supabaseListFleet();
  if (!isDatabaseEnabled()) return mockGetFleet();
  try {
    const rows = await prisma.vehicle.findMany({
      include: { driver: { include: { user: true } } }
    });
    return rows.map((v) => ({
      plate: v.plateNumber,
      type: v.type,
      driver: v.driver?.user.name ?? "—",
      location: v.driver?.currentLocation ?? "Việt Nam",
      status: v.status === "available" ? "Xe rỗng" : v.status === "busy" ? "Đang chạy" : "Bảo trì",
      utilization: v.status === "busy" ? "88%" : "70%",
      lat: v.lat ?? 16,
      lng: v.lng ?? 107
    }));
  } catch {
    if (prefersSupabase()) return supabaseListFleet();
    return mockGetFleet();
  }
}

export async function createQuote(req: QuoteRequest): Promise<QuoteResponse> {
  if (prefersSupabase()) {
    const quote = await supabaseCreateQuote(req);
    if (quote) return quote;
  }
  return mockCreateQuote(req);
}

export async function appendTrackingPoint(
  code: string,
  input: { latitude: number; longitude: number; speed?: number }
): Promise<boolean> {
  if (prefersSupabase()) return supabaseAppendTracking(code, input);
  return false;
}
