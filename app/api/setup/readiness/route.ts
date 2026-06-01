import { NextResponse } from "next/server";
import { getProductionReadiness } from "@/lib/production/readiness";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { supabaseListShipments } from "@/lib/supabase/data-access";
import {
  checkDriverTripOffersMigration,
  checkShipmentEventsMigration
} from "@/lib/supabase/check-migrations";

export async function GET() {
  const { ready, checks, siteUrl } = getProductionReadiness();
  const driverOffers = await checkDriverTripOffersMigration();
  checks.push({
    id: "driver_trip_offers",
    label: "SQL 019 — Chốt chuyến tài xế",
    ok: driverOffers.ok,
    detail: driverOffers.detail
  });
  const shipmentEvents = await checkShipmentEventsMigration();
  checks.push({
    id: "shipment_events",
    label: "SQL 020 — Nhật ký điều khiển",
    ok: shipmentEvents.ok,
    detail: shipmentEvents.detail
  });
  const supabase = getSupabaseConfig();

  let dbOk = false;
  let shipmentCount = 0;
  let dbError: string | null = null;

  if (supabase.enabled) {
    try {
      const rows = await supabaseListShipments();
      shipmentCount = rows.length;
      dbOk = true;
    } catch (e) {
      dbError = e instanceof Error ? e.message : "Query failed";
    }
  }

  return NextResponse.json({
    ready: ready && dbOk,
    siteUrl,
    checks,
    database: { connected: dbOk, shipmentCount, error: dbError },
    authCallbackUrl: `${siteUrl}/auth/callback`,
    timestamp: new Date().toISOString()
  });
}
