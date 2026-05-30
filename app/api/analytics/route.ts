import { NextResponse } from "next/server";
import { buildAnalyticsFromShipments } from "@/lib/analytics-from-shipments";
import { resolveShipmentListFilters } from "@/lib/auth/shipment-scope";
import { listShipments } from "@/lib/repositories/shipment.repository";

export async function GET(request: Request) {
  const scope = new URL(request.url).searchParams.get("scope");
  const filters = await resolveShipmentListFilters(scope);

  const shipments =
    filters?.driverId === "__no_driver__" ? [] : await listShipments(filters);

  const analytics = buildAnalyticsFromShipments(shipments);

  return NextResponse.json({
    ...analytics,
    revenueByMonth: [
      { month: "T1", value: Math.max(1, shipments.length * 0.8) },
      { month: "T2", value: Math.max(2, shipments.length * 0.9) },
      { month: "T3", value: Math.max(3, shipments.length * 1.0) },
      { month: "T4", value: Math.max(4, shipments.length * 1.1) },
      { month: "T5", value: Math.max(5, shipments.length * 1.2) }
    ]
  });
}
