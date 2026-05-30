import { NextResponse } from "next/server";
import { listVehicleCategories } from "@/lib/cms/vehicle-categories";

export async function GET() {
  const vehicles = await listVehicleCategories(false);
  return NextResponse.json(vehicles);
}
