import { NextResponse } from "next/server";
import { listPopularRoutesMerged, listPricingTable } from "@/lib/repositories/pricing.repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("format") === "cards") {
    return NextResponse.json(await listPopularRoutesMerged());
  }
  return NextResponse.json(await listPricingTable());
}
