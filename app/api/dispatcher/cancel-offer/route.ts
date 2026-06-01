import { NextResponse } from "next/server";
import { dispatcherRoles, requireApiRoles } from "@/lib/auth/api-guard";
import { cancelTripOffer } from "@/lib/driver/trips";

export async function POST(request: Request) {
  const { error } = await requireApiRoles(dispatcherRoles);
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const code = body.code ? String(body.code) : "";
  if (!code) {
    return NextResponse.json({ message: "Thiếu mã đơn (code)" }, { status: 400 });
  }

  try {
    await cancelTripOffer(code);
    return NextResponse.json({ ok: true, message: `Đã hủy gửi chuyến ${code} — có thể gán lại.` });
  } catch (e) {
    return NextResponse.json({ message: (e as Error).message }, { status: 400 });
  }
}
