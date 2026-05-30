import { NextResponse } from "next/server";
import { appendTrackingPoint } from "@/lib/repositories/shipment.repository";

type Props = { params: Promise<{ code: string }> };

export async function POST(request: Request, { params }: Props) {
  const { code } = await params;
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
