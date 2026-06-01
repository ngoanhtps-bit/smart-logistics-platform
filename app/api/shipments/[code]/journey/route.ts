import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { listShipmentEvents } from "@/lib/operations/shipment-events";
import { findShipment } from "@/lib/repositories/shipment.repository";
import {
  buildJourneySteps,
  getJourneyActions,
  journeyStatusMessage,
  shipmentProgressPercent
} from "@/lib/shipment/workflow";

type Props = { params: Promise<{ code: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { code } = await params;
  const shipment = await findShipment(code);
  if (!shipment) {
    return NextResponse.json({ message: "Không tìm thấy vận đơn" }, { status: 404 });
  }

  const events = await listShipmentEvents(code, 30);
  const user = await getSessionUser();

  return NextResponse.json({
    shipment,
    steps: buildJourneySteps(shipment, events),
    events,
    nextActions: getJourneyActions(shipment, user?.role ?? null),
    statusMessage: journeyStatusMessage(shipment),
    progressPercent: shipmentProgressPercent(shipment),
    role: user?.role ?? null
  });
}
