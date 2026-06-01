import { NextResponse } from "next/server";
import { dispatcherRoles, driverRoles, requireApiRoles } from "@/lib/auth/api-guard";
import { notifyShipmentEvent } from "@/lib/notification-hub";
import { createInvoiceForShipment } from "@/lib/invoices";
import { supabaseGetShipmentRow } from "@/lib/supabase/data-access";
import { findShipment, patchShipment } from "@/lib/repositories/shipment.repository";
import type { ShipmentStatus } from "@/types/logistics";

type Props = { params: Promise<{ code: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { code } = await params;
  const shipment = await findShipment(code);
  if (!shipment) {
    return NextResponse.json({ message: "Không tìm thấy vận đơn" }, { status: 404 });
  }
  return NextResponse.json(shipment);
}

export async function PATCH(request: Request, { params }: Props) {
  const { code } = await params;
  const body = await request.json();

  const isStatusOnly = body.status && !body.driverName && !body.vehiclePlate;
  const guard = isStatusOnly
    ? await requireApiRoles([...dispatcherRoles, ...driverRoles])
    : await requireApiRoles(dispatcherRoles);
  if (guard.error) return guard.error;

  let shipment;
  try {
    shipment = await patchShipment(code, {
      status: body.status as ShipmentStatus | undefined,
      driverName: body.driverName,
      driverPhone: body.driverPhone,
      vehiclePlate: body.vehiclePlate,
      vehicleType: body.vehicleType
    });
  } catch (e) {
    return NextResponse.json({ message: (e as Error).message }, { status: 409 });
  }
  if (!shipment) {
    return NextResponse.json({ message: "Không tìm thấy vận đơn" }, { status: 404 });
  }
  if (body.status === "delivered") {
    const row = await supabaseGetShipmentRow(code);
    let customerEmail = "customer@demo.vn";
    let customerPhone: string | undefined;
    if (row?.customer_id) {
      void createInvoiceForShipment({
        shipmentCode: code,
        customerId: row.customer_id,
        weight: row.weight ?? undefined
      });
      const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
      const admin = createSupabaseAdminClient();
      if (admin) {
        const { data: cu } = await admin.from("users").select("email, phone").eq("id", row.customer_id).maybeSingle();
        if (cu?.email) customerEmail = cu.email as string;
        customerPhone = (cu?.phone as string) ?? undefined;
      }
    }
    void notifyShipmentEvent({
      event: "delivered",
      code,
      email: customerEmail,
      phone: customerPhone
    });
  } else if (body.driverName) {
    void notifyShipmentEvent({ event: "assigned", code, phone: body.driverPhone });
  }
  return NextResponse.json(shipment);
}
