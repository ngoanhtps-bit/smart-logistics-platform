import { NextResponse, type NextRequest } from "next/server";
import { driverRoles, requireApiRoles } from "@/lib/auth/api-guard";
import { driverRespondTrip } from "@/lib/driver/trips";

type Props = { params: Promise<{ code: string }> };

export async function POST(request: NextRequest, { params }: Props) {
  const { user, error } = await requireApiRoles(driverRoles);
  if (error) return error;
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { code } = await params;
  const body = await request.json().catch(() => ({}));
  const action = body.action === "decline" ? "decline" : "accept";

  try {
    const result = await driverRespondTrip(user.id, code, action, {
      plate: body.plate ? String(body.plate) : undefined,
      phone: body.phone ? String(body.phone) : undefined,
      note: body.note ? String(body.note) : undefined,
      declineReason: body.declineReason ? String(body.declineReason) : undefined
    });
    return NextResponse.json({
      ...result,
      message:
        action === "accept"
          ? `Đã chốt chuyến ${code}. Điều phối đã nhận thông tin xe.`
          : `Đã từ chối chuyến ${code}.`
    });
  } catch (e) {
    return NextResponse.json({ message: (e as Error).message }, { status: 400 });
  }
}
