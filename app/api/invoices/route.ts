import { NextResponse } from "next/server";
import { dispatcherRoles, requireApiRoles } from "@/lib/auth/api-guard";
import { getSessionUser } from "@/lib/auth/session";
import { listInvoices } from "@/lib/invoices";

export async function GET(request: Request) {
  const scope = new URL(request.url).searchParams.get("scope");
  const shipment = new URL(request.url).searchParams.get("shipment") ?? undefined;

  const user = await getSessionUser();
  const filters =
    scope === "mine" && user?.role === "customer"
      ? { customerId: user.id }
      : shipment
        ? { shipmentCode: shipment }
        : undefined;

  return NextResponse.json(await listInvoices(filters));
}

export async function PATCH(request: Request) {
  const { error } = await requireApiRoles(dispatcherRoles);
  if (error) return error;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ message: "Thiếu id hóa đơn" }, { status: 400 });

  const { markInvoicePaid } = await import("@/lib/invoices");
  const invoice = await markInvoicePaid(String(id));
  if (!invoice) return NextResponse.json({ message: "Không cập nhật được" }, { status: 404 });

  return NextResponse.json(invoice);
}
