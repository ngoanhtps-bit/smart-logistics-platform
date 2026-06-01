import { NextResponse } from "next/server";
import { dispatcherRoles, requireApiRoles } from "@/lib/auth/api-guard";
import { rankDriversForShipment } from "@/lib/dispatch/suggest-drivers";
import { listRegisteredDrivers } from "@/lib/driver/trips";
import { listFleet, listShipments, findShipment } from "@/lib/repositories/shipment.repository";

export async function GET(request: Request) {
  const { error } = await requireApiRoles(dispatcherRoles);
  if (error) return error;

  const code = new URL(request.url).searchParams.get("code");
  if (!code) {
    return NextResponse.json({ message: "Thiếu mã đơn (code)" }, { status: 400 });
  }

  const shipment = await findShipment(code);
  if (!shipment) {
    return NextResponse.json({ message: "Không tìm thấy đơn" }, { status: 404 });
  }

  const [drivers, fleet, shipments] = await Promise.all([
    listRegisteredDrivers(),
    listFleet(),
    listShipments()
  ]);

  const suggestions = rankDriversForShipment(shipment, drivers, fleet, shipments);

  return NextResponse.json({ code, suggestions });
}
