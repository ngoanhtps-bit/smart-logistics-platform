import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { notifyShipmentEvent } from "@/lib/notification-hub";
import { resolveShipmentListFilters } from "@/lib/auth/shipment-scope";
import { dispatcherRoles, requireApiRoles } from "@/lib/auth/api-guard";
import { getSessionUser } from "@/lib/auth/session";
import { createShipment, deleteShipments, listShipments } from "@/lib/repositories/shipment.repository";
import { isDeletableShipmentStatus } from "@/lib/shipments/deletable-status";
import { quoteSchema } from "@/lib/validators/quote";

export async function GET(request: Request) {
  const scope = new URL(request.url).searchParams.get("scope");
  const user = await getSessionUser();

  if (scope === "mine") {
    if (!user) {
      return NextResponse.json({ message: "Vui lòng đăng nhập" }, { status: 401 });
    }
  } else {
    const { error } = await requireApiRoles(dispatcherRoles);
    if (error) return error;
  }

  const filters = await resolveShipmentListFilters(scope);

  if (filters?.driverId === "__no_driver__") {
    return NextResponse.json([]);
  }

  const shipments = await listShipments(filters);
  return NextResponse.json(shipments);
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`shipments:${ip}`, 20);
  if (!limited.ok) {
    return NextResponse.json({ message: `Quá nhiều yêu cầu. Thử lại sau ${limited.retryAfter}s` }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = quoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Dữ liệu không hợp lệ", errors: parsed.error.flatten() }, { status: 400 });
    }

    const user = await getSessionUser();
    const customerId = user?.role === "customer" ? user.id : undefined;

    const shipment = await createShipment(parsed.data, customerId);
    void notifyShipmentEvent({
      event: "created",
      code: shipment.code,
      phone: user?.phone ?? "0901668888",
      email: user?.email ?? "ops@smartlogistics.vn"
    });
    return NextResponse.json(shipment, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Không tạo được đơn" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { user, error } = await requireApiRoles(["admin", "dispatcher", "customer"]);
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  let codes = Array.isArray(body.codes) ? body.codes.map(String) : [];
  if (!codes.length) {
    return NextResponse.json({ message: "Thiếu danh sách mã vận đơn (codes)" }, { status: 400 });
  }

  if (user?.role === "customer") {
    const mine = await listShipments({ customerId: user.id });
    const allowed = new Set(mine.filter((s) => isDeletableShipmentStatus(s.status)).map((s) => s.code));
    codes = codes.filter((c: string) => allowed.has(c));
    if (!codes.length) {
      return NextResponse.json(
        { message: "Chỉ xóa được đơn nháp/báo giá/hủy của chính bạn." },
        { status: 403 }
      );
    }
  }

  try {
    const result = await deleteShipments(codes);
    const msg =
      result.deleted > 0
        ? `Đã xóa ${result.deleted} đơn (nháp/báo giá/hủy).`
        : "Không xóa được đơn nào — chỉ xóa đơn ở trạng thái nháp, báo giá hoặc đã hủy.";
    return NextResponse.json({ ...result, message: msg, ok: result.deleted > 0 });
  } catch (e) {
    return NextResponse.json({ message: (e as Error).message }, { status: 400 });
  }
}
