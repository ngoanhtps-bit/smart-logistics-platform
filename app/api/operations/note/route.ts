import { NextResponse } from "next/server";
import { dispatcherRoles, requireApiRoles } from "@/lib/auth/api-guard";
import { getSessionUser } from "@/lib/auth/session";
import { logShipmentEvent } from "@/lib/operations/shipment-events";

export async function POST(request: Request) {
  const { user, error } = await requireApiRoles(dispatcherRoles);
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const code = body.code ? String(body.code) : "";
  const note = body.note ? String(body.note).trim() : "";
  if (!code || !note) {
    return NextResponse.json({ message: "Thiếu mã đơn hoặc nội dung ghi chú" }, { status: 400 });
  }

  const session = user ?? (await getSessionUser());
  await logShipmentEvent({
    shipmentCode: code,
    eventType: "note",
    message: note,
    actorUserId: session?.id,
    actorRole: session?.role
  });

  return NextResponse.json({ ok: true, message: "Đã ghi nhật ký điều khiển" });
}
