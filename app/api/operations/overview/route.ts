import { NextResponse } from "next/server";
import { dispatcherRoles, requireApiRoles } from "@/lib/auth/api-guard";
import { buildOperationsOverview } from "@/lib/operations/overview";
import { listShipmentEvents } from "@/lib/operations/shipment-events";
import { listShipments } from "@/lib/repositories/shipment.repository";

export async function GET() {
  const { error } = await requireApiRoles(dispatcherRoles);
  if (error) return error;

  const shipments = await listShipments();
  const overview = buildOperationsOverview(shipments);
  const recentEvents = await listShipmentEvents(undefined, 25);

  return NextResponse.json({ overview, recentEvents, shipments });
}
