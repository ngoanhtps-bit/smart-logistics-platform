import { NextResponse } from "next/server";
import { getTrackingSnapshot } from "@/lib/repositories/shipment.repository";

type Props = { params: Promise<{ code: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { code } = await params;
  const tracking = await getTrackingSnapshot(code);
  if (!tracking) {
    return NextResponse.json({ message: "Không tìm thấy tracking" }, { status: 404 });
  }
  return NextResponse.json(tracking);
}
