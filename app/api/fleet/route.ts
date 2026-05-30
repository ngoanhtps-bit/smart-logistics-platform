import { NextResponse } from "next/server";
import { listFleet } from "@/lib/repositories/shipment.repository";

export async function GET() {
  return NextResponse.json(await listFleet());
}
