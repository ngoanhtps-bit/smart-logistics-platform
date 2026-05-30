import { NextResponse } from "next/server";
import { getProductionReadiness } from "@/lib/production/readiness";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { supabaseListShipments } from "@/lib/supabase/data-access";

export async function GET() {
  const { ready, checks, siteUrl } = getProductionReadiness();
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
