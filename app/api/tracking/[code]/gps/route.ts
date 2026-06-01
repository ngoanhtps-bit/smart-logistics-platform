import { NextResponse } from "next/server";
import { driverRoles, requireApiRoles } from "@/lib/auth/api-guard";
import { driverCanUpdateShipment } from "@/lib/driver/trips";
import { appendTrackingPoint } from "@/lib/repositories/shipment.repository";

type Props = { params: Promise<{ code: string }> };

export async function POST(request: Request, { params }: Props) {
  const { user, error } = await requireApiRoles(driverRoles);
  if (error) return error;
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { code } = await params;
  const can = await driverCanUpdateShipment(user.id, code);
  if (!can) {
    return NextResponse.json({ message: "Bạn không có quyền gửi GPS cho chuyến này" }, { status: 403 });
  }

  const body = await request.json();

  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ message: "Tọa độ không hợp lệ" }, { status: 400 });
  }

  const ok = await appendTrackingPoint(code, {
    latitude,
    longitude,
    speed: body.speed ? Number(body.speed) : undefined
  });

  if (!ok) {
    return NextResponse.json({ message: "Không ghi được GPS" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, code });
}
