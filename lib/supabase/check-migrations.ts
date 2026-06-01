import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseConfig } from "@/lib/supabase/config";

/** Kiểm tra migration 019 (cột offer_status trên shipments). */
export async function checkDriverTripOffersMigration(): Promise<{ ok: boolean; detail: string }> {
  if (!getSupabaseConfig().enabled) {
    return { ok: false, detail: "Chưa bật Supabase" };
  }
  const client = createSupabaseAdminClient();
  if (!client) {
    return { ok: false, detail: "Thiếu SUPABASE_SERVICE_ROLE_KEY" };
  }
  const { error } = await client.from("shipments").select("offer_status").limit(1);
  if (error) {
    return {
      ok: false,
      detail: `Chưa chạy supabase/019_driver_trip_offers.sql — ${error.message}`
    };
  }
  return { ok: true, detail: "App tài xế & gửi chốt chuyến sẵn sàng" };
}

/** Kiểm tra migration 020 (bảng shipment_events). */
export async function checkShipmentEventsMigration(): Promise<{ ok: boolean; detail: string }> {
  if (!getSupabaseConfig().enabled) {
    return { ok: false, detail: "Chưa bật Supabase" };
  }
  const client = createSupabaseAdminClient();
  if (!client) {
    return { ok: false, detail: "Thiếu SUPABASE_SERVICE_ROLE_KEY" };
  }
  const { error } = await client.from("shipment_events").select("id").limit(1);
  if (error) {
    return {
      ok: false,
      detail: `Chưa chạy supabase/020_shipment_events.sql — ${error.message}`
    };
  }
  return { ok: true, detail: "Nhật ký điều khiển vận hành sẵn sàng" };
}
