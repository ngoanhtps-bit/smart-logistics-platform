import { NextResponse } from "next/server";
import { requireApiRoles } from "@/lib/auth/api-guard";
import { listDriverTrips } from "@/lib/driver/trips";

export async function GET() {
  const { user, error } = await requireApiRoles(["driver"]);
  if (error) return error;
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const trips = await listDriverTrips(user.id);
  return NextResponse.json(trips);
}
