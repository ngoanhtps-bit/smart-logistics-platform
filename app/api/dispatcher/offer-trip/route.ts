import { NextResponse } from "next/server";
import { requireApiRoles } from "@/lib/auth/api-guard";
import { offerTripToDriver } from "@/lib/driver/trips";

export async function POST(request: Request) {
  const { error } = await requireApiRoles(["dispatcher", "admin"]);
  if (error) return error;

  try {
    const body = await request.json();
    const result = await offerTripToDriver({
      code: String(body.code ?? ""),
      targetDriverUserId: String(body.targetDriverUserId ?? ""),
      vehiclePlate: body.vehiclePlate ? String(body.vehiclePlate) : undefined,
      vehicleType: body.vehicleType ? String(body.vehicleType) : undefined,
      dispatcherNote: body.note ? String(body.note) : undefined
    });
    return NextResponse.json({
      ...result,
      message: `Đã gửi chuyến ${result.code} cho tài xế — chờ chốt trên app /driver.`
    });
  } catch (e) {
    return NextResponse.json({ message: (e as Error).message }, { status: 400 });
  }
}
