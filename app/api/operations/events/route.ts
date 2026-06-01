import { NextResponse } from "next/server";
import { dispatcherRoles, requireApiRoles } from "@/lib/auth/api-guard";
import { listShipmentEvents } from "@/lib/operations/shipment-events";

export async function GET(request: Request) {
  const { error } = await requireApiRoles(dispatcherRoles);
  if (error) return error;

  const code = new URL(request.url).searchParams.get("code") ?? undefined;
  const limit = Math.min(100, Number(new URL(request.url).searchParams.get("limit") ?? 50));

  const events = await listShipmentEvents(code, limit);
  return NextResponse.json({ events });
}
