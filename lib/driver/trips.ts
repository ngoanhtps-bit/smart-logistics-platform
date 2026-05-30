import { createAppNotification } from "@/lib/notifications/app-notifications";
import { statusLabels } from "@/lib/status-labels";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseGetDriverIdForUser } from "@/lib/supabase/data-access";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { DriverTripOffer, ShipmentStatus } from "@/types/logistics";

type ShipmentRow = {
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
  offer_status: string;
  target_driver_id: string | null;
  driver_id: string | null;
  driver_confirmed_at: string | null;
  driver_declined_at: string | null;
  driver_report_plate: string | null;
  driver_report_phone: string | null;
  driver_note: string | null;
};

function mapTrip(row: ShipmentRow): DriverTripOffer {
  const status = row.status as ShipmentStatus;
  return {
    code: row.code,
    route: `${row.pickup_location} → ${row.delivery_location}`,
    pickup: row.pickup_location,
    delivery: row.delivery_location,
    cargoType: row.cargo_type,
    weight: row.weight ?? "",
    vehicleType: row.vehicle_type ?? "—",
    status,
    statusLabel: statusLabels[status] ?? row.status,
    eta: row.eta ? new Date(row.eta).toLocaleString("vi-VN") : "Đang cập nhật",
    offerStatus: (row.offer_status as DriverTripOffer["offerStatus"]) || "none",
    targetDriverId: row.target_driver_id,
    driverConfirmedAt: row.driver_confirmed_at ?? undefined,
    driverReportPlate: row.driver_report_plate ?? undefined,
    driverReportPhone: row.driver_report_phone ?? undefined,
    driverNote: row.driver_note ?? undefined
  };
}

async function client() {
  return createSupabaseAdminClient();
}

export async function getDriverIdForUser(userId: string) {
  return supabaseGetDriverIdForUser(userId);
}

export async function listDriverTrips(userId: string) {
  const c = await client();
  if (!c) return { pending: [] as DriverTripOffer[], active: [] as DriverTripOffer[], history: [] as DriverTripOffer[] };

  const driverId = await getDriverIdForUser(userId);
  if (!driverId) {
    return { pending: [], active: [], history: [], noDriverProfile: true as const };
  }

  const { data, error } = await c
    .from("shipments")
    .select(
      "id, code, pickup_location, delivery_location, cargo_type, weight, vehicle_type, status, eta, created_at, offer_status, target_driver_id, driver_id, driver_confirmed_at, driver_declined_at, driver_report_plate, driver_report_phone, driver_note"
    )
    .or(`target_driver_id.eq.${driverId},driver_id.eq.${driverId}`)
    .order("created_at", { ascending: false });

  if (error || !data) return { pending: [], active: [], history: [] };

  const rows = data as ShipmentRow[];
  const pending = rows
    .filter((r) => r.target_driver_id === driverId && r.offer_status === "pending")
    .map(mapTrip);
  const active = rows
    .filter(
      (r) =>
        r.driver_id === driverId &&
        r.offer_status === "accepted" &&
        !["delivered", "cancelled"].includes(r.status)
    )
    .map(mapTrip);
  const history = rows
    .filter((r) => r.driver_id === driverId && ["delivered", "cancelled"].includes(r.status))
    .slice(0, 20)
    .map(mapTrip);

  return { pending, active, history, driverId };
}

export async function notifyAllDriversNewShipment(code: string, route: string) {
  const c = await client();
  if (!c) return;

  const { data: drivers } = await c
    .from("drivers")
    .select("user_id, id")
    .not("user_id", "is", null);

  const userIds = [...new Set((drivers ?? []).map((d) => d.user_id as string).filter(Boolean))];
  for (const uid of userIds) {
    await createAppNotification({
      userId: uid,
      title: `Chuyến mới ${code}`,
      body: `${route} — vào App tài xế để xem và chốt chuyến.`,
      type: "info",
      shipmentCode: code
    });
  }
}

export async function offerTripToDriver(input: {
  code: string;
  targetDriverUserId: string;
  vehiclePlate?: string;
  vehicleType?: string;
  dispatcherNote?: string;
}) {
  const c = await client();
  if (!c) throw new Error("Không kết nối Supabase");

  const driverId = await getDriverIdForUser(input.targetDriverUserId);
  if (!driverId) throw new Error("Tài xế chưa có hồ sơ drivers — admin duyệt tài xế trước");

  let vehicleId: string | null = null;
  if (input.vehiclePlate) {
    const { data: v } = await c.from("vehicles").select("id").eq("plate_number", input.vehiclePlate).maybeSingle();
    vehicleId = (v?.id as string) ?? null;
  }

  const { data, error } = await c
    .from("shipments")
    .update({
      target_driver_id: driverId,
      offer_status: "pending",
      status: "assigned",
      vehicle_type: input.vehicleType ?? undefined,
      vehicle_id: vehicleId ?? undefined,
      driver_note: input.dispatcherNote ?? null,
      updated_at: new Date().toISOString()
    })
    .eq("code", input.code)
    .select("code, pickup_location, delivery_location")
    .single();

  if (error) throw new Error(error.message);

  const route = `${data.pickup_location} → ${data.delivery_location}`;
  await createAppNotification({
    userId: input.targetDriverUserId,
    title: `Cần chốt chuyến ${input.code}`,
    body: `${route}${input.vehiclePlate ? ` · xe gợi ý ${input.vehiclePlate}` : ""}. Mở /driver để Xác nhận hoặc Từ chối.`,
    type: "warning",
    shipmentCode: input.code
  });

  return { code: input.code, driverId, route };
}

export async function driverRespondTrip(
  userId: string,
  code: string,
  action: "accept" | "decline",
  report?: { plate?: string; phone?: string; note?: string }
) {
  const c = await client();
  if (!c) throw new Error("Không kết nối Supabase");

  const driverId = await getDriverIdForUser(userId);
  if (!driverId) throw new Error("Tài khoản chưa liên kết bảng drivers");

  const { data: row, error: loadErr } = await c
    .from("shipments")
    .select("id, code, target_driver_id, offer_status, pickup_location, delivery_location")
    .eq("code", code)
    .maybeSingle();

  if (loadErr || !row) throw new Error("Không tìm thấy chuyến");
  if (row.target_driver_id !== driverId) throw new Error("Chuyến không gửi cho bạn");
  if (row.offer_status !== "pending") throw new Error("Chuyến đã được xử lý");

  const now = new Date().toISOString();
  const route = `${row.pickup_location} → ${row.delivery_location}`;

  if (action === "decline") {
    await c
      .from("shipments")
      .update({
        offer_status: "declined",
        driver_declined_at: now,
        driver_note: report?.note ?? null,
        target_driver_id: null,
        updated_at: now
      })
      .eq("code", code);

    await notifyDispatchers(
      `Tài xế từ chối ${code}`,
      `${route}. Điều phối gán tài xế khác.`
    );
    return { ok: true, action: "decline" as const };
  }

  let vehicleId: string | null = null;
  const plate = report?.plate?.trim();
  if (plate) {
    const { data: v } = await c.from("vehicles").select("id").eq("plate_number", plate).maybeSingle();
    if (v?.id) vehicleId = v.id as string;
    else {
      vehicleId = `v-${Date.now()}`;
      await c.from("vehicles").insert({
        id: vehicleId,
        plate_number: plate,
        type: "Xe tải",
        status: "busy"
      });
    }
    await c.from("drivers").update({ vehicle_id: vehicleId }).eq("id", driverId);
  }

  const { data: user } = await c.from("users").select("name, phone").eq("id", userId).maybeSingle();
  const phone = report?.phone?.trim() || (user?.phone as string) || "";

  await c
    .from("shipments")
    .update({
      offer_status: "accepted",
      driver_id: driverId,
      driver_confirmed_at: now,
      driver_report_plate: plate ?? null,
      driver_report_phone: phone || null,
      driver_note: report?.note ?? null,
      vehicle_id: vehicleId ?? undefined,
      status: "assigned",
      updated_at: now
    })
    .eq("code", code);

  await notifyDispatchers(
    `Tài xế đã chốt ${code}`,
    `${user?.name ?? "Tài xế"} · ${plate ?? "—"} · ${phone || "—"} · ${route}`
  );

  return { ok: true, action: "accept" as const, plate, phone };
}

async function notifyDispatchers(title: string, body: string) {
  const c = await client();
  if (!c) return;
  const { data: dispatchers } = await c.from("users").select("id").in("role", ["dispatcher", "admin"]);
  for (const u of dispatchers ?? []) {
    await createAppNotification({
      userId: u.id as string,
      title,
      body,
      type: "success"
    });
  }
}

export async function listRegisteredDrivers() {
  const c = await client();
  if (!c || !getSupabaseConfig().enabled) return [];

  const { data: drivers } = await c.from("drivers").select("id, user_id, license_number, vehicle_id");
  if (!drivers?.length) return [];

  const userIds = drivers.map((d) => d.user_id as string).filter(Boolean);
  const { data: users } = await c
    .from("users")
    .select("id, name, phone, email, account_status")
    .in("id", userIds)
    .eq("role", "driver");

  const vehicleIds = drivers.map((d) => d.vehicle_id).filter(Boolean) as string[];
  const { data: vehicles } = vehicleIds.length
    ? await c.from("vehicles").select("id, plate_number, type").in("id", vehicleIds)
    : { data: [] };

  const vehicleById = new Map((vehicles ?? []).map((v) => [v.id as string, v]));

  return (users ?? [])
    .filter((u) => !u.account_status || u.account_status === "approved")
    .map((u) => {
      const d = drivers.find((x) => x.user_id === u.id);
      const v = d?.vehicle_id ? vehicleById.get(d.vehicle_id as string) : null;
      return {
        userId: u.id as string,
        driverId: d?.id as string,
        name: u.name as string,
        phone: (u.phone as string) ?? "",
        email: u.email as string,
        plate: (v?.plate_number as string) ?? "",
        vehicleType: (v?.type as string) ?? ""
      };
    });
}
