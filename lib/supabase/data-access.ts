import { isDeletableShipmentStatus } from "@/lib/shipments/deletable-status";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { logShipmentEvent } from "@/lib/operations/shipment-events";
import { assertStatusTransition } from "@/lib/shipment/status-transitions";
import { statusLabels } from "@/lib/status-labels";
import type {
  DriverOfferStatus,
  FleetVehicle,
  QuoteRequest,
  QuoteResponse,
  Shipment,
  ShipmentStatus,
  TrackingSnapshot
} from "@/types/logistics";

type DbShipment = {
  id: string;
  code: string;
  pickup_location: string;
  delivery_location: string;
  cargo_type: string;
  weight: string | null;
  vehicle_type: string | null;
  status: string;
  eta: string | null;
  created_at: string;
  updated_at?: string | null;
  driver_id?: string | null;
  vehicle_id?: string | null;
  offer_status?: string | null;
  target_driver_id?: string | null;
  driver_confirmed_at?: string | null;
  driver_report_plate?: string | null;
  driver_report_phone?: string | null;
  driver_note?: string | null;
};

async function getClient() {
  const admin = createSupabaseAdminClient();
  if (admin) return admin;
  const server = await createSupabaseServerClient();
  return server;
}

export function isSupabaseDataEnabled() {
  return getSupabaseConfig().enabled;
}

function mapShipment(
  row: DbShipment,
  driverName = "Chưa gán",
  driverPhone = "",
  plate = "—",
  targetDriverName?: string
): Shipment {
  const status = row.status as ShipmentStatus;
  const offerStatus = (row.offer_status as DriverOfferStatus) || "none";
  const displayDriver =
    offerStatus === "pending" && targetDriverName
      ? `${targetDriverName} (chờ chốt)`
      : driverName;
  const displayPlate =
    row.driver_report_plate && offerStatus === "accepted" ? row.driver_report_plate : plate;

  return {
    code: row.code,
    route: `${row.pickup_location} → ${row.delivery_location}`,
    pickup: row.pickup_location,
    delivery: row.delivery_location,
    driver: displayDriver,
    driverPhone: row.driver_report_phone || driverPhone,
    vehiclePlate: displayPlate,
    vehicleType: row.vehicle_type ?? "—",
    status,
    statusLabel: statusLabels[status] ?? row.status,
    eta: row.eta ? new Date(row.eta).toLocaleString("vi-VN") : "Đang cập nhật",
    cargoType: row.cargo_type,
    weight: row.weight ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
    offerStatus,
    targetDriverId: row.target_driver_id ?? null,
    driverConfirmedAt: row.driver_confirmed_at ?? undefined,
    driverReportPlate: row.driver_report_plate ?? undefined,
    driverReportPhone: row.driver_report_phone ?? undefined,
    driverNote: row.driver_note ?? undefined
  };
}

async function loadDriverVehicleMaps(rows: DbShipment[]) {
  const client = await getClient();
  const driverNames = new Map<string, { name: string; phone: string }>();
  const targetDriverNames = new Map<string, string>();
  const vehiclePlates = new Map<string, string>();

  if (!client) return { driverNames, vehiclePlates, targetDriverNames };

  const driverIds = [
    ...new Set([...rows.map((r) => r.driver_id), ...rows.map((r) => r.target_driver_id)].filter(Boolean))
  ] as string[];
  const vehicleIds = [...new Set(rows.map((r) => r.vehicle_id).filter(Boolean))] as string[];

  if (driverIds.length > 0) {
    const { data: drivers } = await client
      .from("drivers")
      .select("id, user_id")
      .in("id", driverIds);
    const userIds = (drivers ?? []).map((d) => d.user_id as string).filter(Boolean);
    if (userIds.length > 0) {
      const { data: users } = await client.from("users").select("id, name, phone").in("id", userIds);
      const userById = new Map((users ?? []).map((u) => [u.id as string, u]));
      for (const d of drivers ?? []) {
        const u = userById.get(d.user_id as string);
        if (u) {
          const info = { name: u.name as string, phone: (u.phone as string) ?? "" };
          driverNames.set(d.id as string, info);
          targetDriverNames.set(d.id as string, info.name);
        }
      }
    }
  }

  if (vehicleIds.length > 0) {
    const { data: vehicles } = await client.from("vehicles").select("id, plate_number").in("id", vehicleIds);
    for (const v of vehicles ?? []) {
      vehiclePlates.set(v.id as string, v.plate_number as string);
    }
  }

  return { driverNames, vehiclePlates, targetDriverNames };
}

async function enrichRows(rows: DbShipment[]): Promise<Shipment[]> {
  const { driverNames, vehiclePlates, targetDriverNames } = await loadDriverVehicleMaps(rows);
  return rows.map((row) => {
    const driver = row.driver_id ? driverNames.get(row.driver_id) : undefined;
    const plate = row.vehicle_id ? vehiclePlates.get(row.vehicle_id) : undefined;
    const targetName = row.target_driver_id ? targetDriverNames.get(row.target_driver_id) : undefined;
    return mapShipment(row, driver?.name, driver?.phone, plate, targetName);
  });
}

export async function supabaseGetDriverIdForUser(userId: string): Promise<string | null> {
  const client = await getClient();
  if (!client) return null;
  const { data } = await client.from("drivers").select("id").eq("user_id", userId).maybeSingle();
  return (data?.id as string) ?? null;
}

export async function supabaseListShipments(filters?: {
  customerId?: string;
  driverId?: string;
}): Promise<Shipment[]> {
  const client = await getClient();
  if (!client) return [];

  let query = client.from("shipments").select("*").order("created_at", { ascending: false });
  if (filters?.customerId) query = query.eq("customer_id", filters.customerId);
  if (filters?.driverId) query = query.eq("driver_id", filters.driverId);

  const { data, error } = await query;
  if (error || !data) return [];

  return enrichRows(data as DbShipment[]);
}

export async function supabaseGetShipmentRow(code: string) {
  const client = await getClient();
  if (!client) return null;
  const { data } = await client
    .from("shipments")
    .select("id, code, customer_id, weight, pickup_location, delivery_location")
    .eq("code", code)
    .maybeSingle();
  return data as {
    id: string;
    code: string;
    customer_id: string;
    weight: string | null;
    pickup_location: string;
    delivery_location: string;
  } | null;
}

export async function supabaseFindShipment(code: string): Promise<Shipment | null> {
  const client = await getClient();
  if (!client) return null;

  const { data, error } = await client.from("shipments").select("*").eq("code", code).maybeSingle();
  if (error || !data) return null;
  const [shipment] = await enrichRows([data as DbShipment]);
  return shipment ?? null;
}

export async function supabaseCreateShipment(
  input: {
    pickup: string;
    delivery: string;
    cargoType: string;
    weight: string;
    dimensions?: string;
    vehicleType: string;
  },
  customerId?: string
): Promise<Shipment | null> {
  const client = await getClient();
  if (!client) return null;

  const d = new Date();
  const code = `SPL-${String(d.getFullYear()).slice(-2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 900 + 100)}`;

  let resolvedCustomerId = customerId;
  if (!resolvedCustomerId) {
    const { data: users } = await client.from("users").select("id").eq("email", "customer@demo.vn").limit(1);
    resolvedCustomerId = users?.[0]?.id ?? "u1";
  }

  const { data, error } = await client
    .from("shipments")
    .insert({
      id: `s-${Date.now()}`,
      code,
      customer_id: resolvedCustomerId,
      pickup_location: input.pickup,
      delivery_location: input.delivery,
      cargo_type: input.cargoType,
      weight: input.weight,
      dimensions: input.dimensions ?? null,
      vehicle_type: input.vehicleType,
      status: "quoted",
      eta: new Date(Date.now() + 3 * 86400000).toISOString()
    })
    .select()
    .single();

  if (error || !data) return null;
  const shipment = mapShipment(data as DbShipment);
  await logShipmentEvent({
    shipmentCode: code,
    eventType: "created",
    message: `${input.pickup} → ${input.delivery} · ${input.cargoType}`
  });
  return shipment;
}

async function resolveVehicleId(
  client: NonNullable<Awaited<ReturnType<typeof getClient>>>,
  plate: string,
  vehicleType?: string
) {
  const { data: existing } = await client.from("vehicles").select("id").eq("plate_number", plate).maybeSingle();
  if (existing?.id) {
    await client.from("vehicles").update({ status: "busy", type: vehicleType ?? undefined }).eq("id", existing.id);
    return existing.id as string;
  }
  const id = `v-${Date.now()}`;
  await client.from("vehicles").insert({
    id,
    plate_number: plate,
    type: vehicleType ?? "Xe tải",
    status: "busy"
  });
  return id;
}

async function resolveDriverId(
  client: NonNullable<Awaited<ReturnType<typeof getClient>>>,
  driverName: string,
  driverPhone?: string,
  vehicleId?: string
) {
  const email = `driver-${driverName.replace(/\s/g, "").toLowerCase()}@fleet.local`;
  const { data: existingUser } = await client.from("users").select("id").eq("email", email).maybeSingle();
  let userId = existingUser?.id as string | undefined;

  if (!userId) {
    userId = `u-d-${Date.now()}`;
    await client.from("users").insert({
      id: userId,
      role: "driver",
      name: driverName,
      email,
      password: "hashed",
      phone: driverPhone ?? null
    });
  } else if (driverPhone) {
    await client.from("users").update({ phone: driverPhone }).eq("id", userId);
  }

  const { data: existingDriver } = await client.from("drivers").select("id").eq("user_id", userId).maybeSingle();
  if (existingDriver?.id) {
    if (vehicleId) {
      await client.from("drivers").update({ vehicle_id: vehicleId }).eq("id", existingDriver.id);
    }
    return existingDriver.id as string;
  }

  const driverId = `d-${Date.now()}`;
  await client.from("drivers").insert({
    id: driverId,
    user_id: userId,
    license_number: "GPLX-DEMO",
    vehicle_id: vehicleId ?? null
  });
  return driverId;
}

export async function supabasePatchShipment(
  code: string,
  input: {
    status?: ShipmentStatus;
    vehicleType?: string;
    driverName?: string;
    driverPhone?: string;
    vehiclePlate?: string;
  }
): Promise<Shipment | null> {
  const client = await getClient();
  if (!client) return null;

  const { data: current } = await client
    .from("shipments")
    .select("status, offer_status")
    .eq("code", code)
    .maybeSingle();

  if (input.status && current?.status) {
    assertStatusTransition(current.status as ShipmentStatus, input.status);
  }

  if (input.driverName) {
    const { data: existing } = await client
      .from("shipments")
      .select("offer_status")
      .eq("code", code)
      .maybeSingle();
    if (existing?.offer_status === "pending") {
      throw new Error("Đơn đang chờ tài xế chốt trên app — hủy gửi chuyến hoặc đợi tài xế phản hồi.");
    }
  }

  let vehicleId: string | undefined;
  let driverId: string | undefined;

  if (input.vehiclePlate) {
    vehicleId = await resolveVehicleId(client, input.vehiclePlate, input.vehicleType);
  }
  if (input.driverName) {
    driverId = await resolveDriverId(client, input.driverName, input.driverPhone, vehicleId);
  }

  const patch: Record<string, unknown> = {
    status: input.status,
    vehicle_type: input.vehicleType,
    driver_id: driverId,
    vehicle_id: vehicleId,
    updated_at: new Date().toISOString()
  };
  if (input.driverName) {
    patch.offer_status = "none";
    patch.target_driver_id = null;
  }

  const { data, error } = await client.from("shipments").update(patch).eq("code", code).select().single();

  if (error || !data) return null;
  const [shipment] = await enrichRows([data as DbShipment]);
  if (shipment) {
    if (input.driverName) {
      await logShipmentEvent({
        shipmentCode: code,
        eventType: "assigned",
        message: `Gán trực tiếp · ${input.driverName} · ${input.vehiclePlate ?? "—"}`
      });
    } else if (input.status) {
      await logShipmentEvent({
        shipmentCode: code,
        eventType: input.status === "cancelled" ? "cancelled" : "status_changed",
        message: `Trạng thái → ${statusLabels[input.status] ?? input.status}`
      });
    }
  }
  return shipment ?? null;
}

export async function supabaseGetTracking(code: string): Promise<TrackingSnapshot | null> {
  const shipment = await supabaseFindShipment(code);
  if (!shipment) return null;

  const client = await getClient();
  if (!client) return null;

  const { data: shipmentRow } = await client.from("shipments").select("id").eq("code", code).single();
  if (!shipmentRow) return null;

  const { data: points } = await client
    .from("shipment_tracking")
    .select("*")
    .eq("shipment_id", shipmentRow.id)
    .order("timestamp", { ascending: true });

  const history =
    points?.map((p) => ({
      latitude: p.latitude as number,
      longitude: p.longitude as number,
      speed: (p.speed as number) ?? 60,
      timestamp: p.timestamp as string
    })) ?? [];

  const current = history[history.length - 1] ?? {
    latitude: 16,
    longitude: 107,
    speed: 60,
    timestamp: new Date().toISOString()
  };

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
    current,
    history,
    timeline: steps.map((step, i) => ({
      step,
      done: i < statusIndex,
      at: i < statusIndex ? current.timestamp : undefined
    }))
  };
}

export async function supabaseListFleet(): Promise<FleetVehicle[]> {
  const client = await getClient();
  if (!client) return [];

  const { data, error } = await client.from("vehicles").select("*");
  if (error || !data) return [];

  const { data: drivers } = await client.from("drivers").select("vehicle_id, current_location, user_id");
  const userIds = [...new Set((drivers ?? []).map((d) => d.user_id as string))];
  const { data: users } = userIds.length
    ? await client.from("users").select("id, name").in("id", userIds)
    : { data: [] };
  const userById = new Map((users ?? []).map((u) => [u.id as string, u.name as string]));
  const driverByVehicle = new Map(
    (drivers ?? []).map((d) => [
      d.vehicle_id as string,
      { name: userById.get(d.user_id as string) ?? "—", location: (d.current_location as string) ?? "Việt Nam" }
    ])
  );

  return data.map((v) => {
    const d = driverByVehicle.get(v.id as string);
    return {
      plate: v.plate_number as string,
      type: v.type as string,
      driver: d?.name ?? "—",
      location: d?.location ?? "Việt Nam",
      status:
        v.status === "available" ? "Xe rỗng" : v.status === "busy" ? "Đang chạy" : "Bảo trì",
      utilization: v.status === "busy" ? "88%" : "70%",
      lat: (v.lat as number) ?? 16,
      lng: (v.lng as number) ?? 107
    };
  });
}

function normalizeCity(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/tp\.?\s*hcm|sai\s*gon|hcm/g, "ho chi minh")
    .replace(/ha\s*noi|hn/g, "ha noi")
    .replace(/hai\s*phong|hp/g, "hai phong")
    .replace(/binh\s*duong|bd/g, "binh duong")
    .replace(/bac\s*ninh/g, "bac ninh")
    .replace(/dong\s*nai/g, "dong nai");
}

function cityMatch(haystack: string, city: string) {
  const n = normalizeCity(haystack);
  const c = normalizeCity(city);
  return n.includes(c) || c.includes(n);
}

type RouteRow = {
  slug: string;
  from_city: string;
  to_city: string;
  container_20: string | null;
  container_40: string | null;
  transit_days: string | null;
  meta_title: string | null;
  meta_desc: string | null;
};

export async function supabaseFindRoutePrice(req: QuoteRequest): Promise<{
  basePrice: string;
  transitDays: string;
  slug: string | null;
} | null> {
  const client = await getClient();
  if (!client) return null;

  const { data, error } = await client.from("route_pricing").select("*");
  if (error || !data?.length) return null;

  const row = (data as RouteRow[]).find(
    (r) => cityMatch(req.pickup, r.from_city) && cityMatch(req.delivery, r.to_city)
  );
  if (!row) return null;

  const use40 = /40|40ft/i.test(req.vehicleType);
  const base = (use40 ? row.container_40 : row.container_20) ?? row.container_40 ?? row.container_20;
  if (!base) return null;

  return {
    basePrice: base,
    transitDays: row.transit_days ?? "3-4 ngày",
    slug: row.slug
  };
}

export async function supabaseCreateQuote(req: QuoteRequest): Promise<QuoteResponse | null> {
  const route = await supabaseFindRoutePrice(req);
  const weightNum = parseFloat(req.weight) || 10;
  const surcharge = weightNum > 25 ? 2.5 : weightNum > 15 ? 1.5 : 0;

  let baseNum = 10.5;
  let transitDays = "2-3 ngày";
  let source = "ước tính";

  if (route) {
    const m = route.basePrice.match(/([\d.]+)/);
    baseNum = m ? parseFloat(m[1]) : baseNum;
    transitDays = route.transitDays;
    source = "bảng giá DB";
  } else {
    const northSouth =
      /ha noi|hai phong|bac ninh/i.test(normalizeCity(req.pickup)) &&
      /ho chi minh|binh duong|dong nai/i.test(normalizeCity(req.delivery));
    baseNum = northSouth ? 18.5 : 10.5;
    transitDays = northSouth ? "3-4 ngày" : "1-2 ngày";
  }

  const total = (baseNum + surcharge).toFixed(1);
  const vehicle =
    /container.*40/i.test(req.vehicleType) ? "Container 40FT" :
    /mooc rào/i.test(req.vehicleType) ? "Mooc rào" :
    /mooc sàn/i.test(req.vehicleType) ? "Mooc sàn" :
    /15/i.test(req.vehicleType) ? "Xe tải 15T" : req.vehicleType;

  const etaDate = new Date(req.shipDate || Date.now());
  etaDate.setDate(etaDate.getDate() + (transitDays.includes("4") ? 4 : 3));

  return {
    id: `QT-${Date.now()}`,
    estimatedPrice: `${total} triệu VND (${source})`,
    suggestedVehicle: vehicle,
    transitDays,
    eta: etaDate.toLocaleDateString("vi-VN"),
    message: route
      ? "Giá tham khảo từ bảng giá tuyến. Điều phối xác nhận trong 12 phút."
      : "Chưa có tuyến trong DB — giá ước tính. Điều phối sẽ báo chính thức."
  };
}

export type RoutePricingRow = {
  slug: string;
  from: string;
  to: string;
  route: string;
  container20: string;
  container40: string;
  eta: string;
  title: string;
  description: string;
};

function mapRouteRow(r: RouteRow): RoutePricingRow {
  return {
    slug: r.slug,
    from: r.from_city,
    to: r.to_city,
    route: `${r.from_city} → ${r.to_city}`,
    container20: r.container_20 ?? "Liên hệ",
    container40: r.container_40 ?? "Liên hệ",
    eta: r.transit_days ?? "2-4 ngày",
    title: r.meta_title ?? `Vận chuyển ${r.from_city} đi ${r.to_city}`,
    description:
      r.meta_desc ??
      `Tuyến ${r.from_city} – ${r.to_city}, container & xe tải, theo dõi GPS thời gian thực.`
  };
}

export async function supabaseListRoutePricing(): Promise<RoutePricingRow[]> {
  const client = await getClient();
  if (!client) return [];

  const { data, error } = await client.from("route_pricing").select("*").order("from_city");
  if (error || !data) return [];
  return (data as RouteRow[]).map(mapRouteRow);
}

export async function supabaseFindRouteBySlug(slug: string): Promise<RoutePricingRow | null> {
  const client = await getClient();
  if (!client) return null;

  const { data, error } = await client.from("route_pricing").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  return mapRouteRow(data as RouteRow);
}

export async function supabaseAppendTracking(
  code: string,
  input: { latitude: number; longitude: number; speed?: number }
): Promise<boolean> {
  const client = await getClient();
  if (!client) return false;

  const { data: row } = await client.from("shipments").select("id, status").eq("code", code).single();
  if (!row) return false;

  const { error } = await client.from("shipment_tracking").insert({
    id: `t-${Date.now()}`,
    shipment_id: row.id,
    latitude: input.latitude,
    longitude: input.longitude,
    speed: input.speed ?? 55,
    timestamp: new Date().toISOString()
  });

  if (error) return false;

  if (row.status === "assigned" || row.status === "pickup" || row.status === "loaded") {
    await client
      .from("shipments")
      .update({ status: "in_transit", updated_at: new Date().toISOString() })
      .eq("code", code);
  }

  return true;
}

export async function supabaseDeleteShipments(codes: string[]) {
  const client = createSupabaseAdminClient() ?? (await getClient());
  if (!client) throw new Error("Không kết nối Supabase");

  const unique = [...new Set(codes.map((c) => c.trim()).filter(Boolean))];
  if (!unique.length) return { deleted: 0, skipped: [] as string[] };

  const { data: rows, error } = await client
    .from("shipments")
    .select("id, code, status")
    .in("code", unique);

  if (error) throw new Error(error.message);

  const deletable = (rows ?? []).filter((r) =>
    isDeletableShipmentStatus(r.status as ShipmentStatus)
  );
  const skipped = unique.filter(
    (code) => !(rows ?? []).some((r) => r.code === code && isDeletableShipmentStatus(r.status as ShipmentStatus))
  );

  const ids = deletable.map((r) => r.id as string);
  if (ids.length) {
    await client.from("shipment_tracking").delete().in("shipment_id", ids);
    const { error: delErr } = await client.from("shipments").delete().in("id", ids);
    if (delErr) throw new Error(delErr.message);
  }

  return {
    deleted: deletable.length,
    codes: deletable.map((r) => r.code as string),
    skipped
  };
}
