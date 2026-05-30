import { NextResponse } from "next/server";
import { isSupabaseDataEnabled } from "@/lib/supabase/data-access";
import { supabaseSearchShipmentsByQuery } from "@/lib/supabase/operational-data";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  if (!q.trim()) {
    return NextResponse.json({ shipments: [] });
  }

  if (!isSupabaseDataEnabled()) {
    return NextResponse.json({ shipments: [] });
  }

  const rows = await supabaseSearchShipmentsByQuery(q);
  return NextResponse.json({
    shipments: rows.map((r) => ({
      code: r.code,
      route: `${r.pickup_location} → ${r.delivery_location}`,
      status: r.status,
      cargo: r.cargo_type
    }))
  });
}
