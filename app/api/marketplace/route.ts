import { NextResponse } from "next/server";
import { dispatcherRoles, requireApiRoles } from "@/lib/auth/api-guard";
import { acceptLoad, listLoads, placeBid } from "@/lib/marketplace";

export async function GET() {
  return NextResponse.json(await listLoads());
}

export async function POST(request: Request) {
  const body = await request.json();

  if (body.action === "bid") {
    const { error } = await requireApiRoles([...dispatcherRoles, "customer"]);
    if (error) return error;

    const load = await placeBid(body.loadId, {
      carrier: body.carrier ?? "Đối tác mới",
      amount: body.amount,
      eta: body.eta
    });
    if (!load) return NextResponse.json({ message: "Không tìm thấy load" }, { status: 404 });
    return NextResponse.json(load);
  }

  if (body.action === "accept") {
    const { error } = await requireApiRoles(dispatcherRoles);
    if (error) return error;

    const load = await acceptLoad(body.loadId, body.bidIndex ?? 0);
    if (!load) return NextResponse.json({ message: "Không chấp nhận được" }, { status: 400 });
    return NextResponse.json(load);
  }

  return NextResponse.json({ message: "Thao tác không hợp lệ" }, { status: 400 });
}
