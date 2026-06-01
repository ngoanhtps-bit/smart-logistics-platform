import { NextResponse } from "next/server";
import { driverRoles, requireApiRoles } from "@/lib/auth/api-guard";
import { getDriverProfileForUser } from "@/lib/driver/trips";

export async function GET() {
  const { user, error } = await requireApiRoles(driverRoles);
  if (error) return error;
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const profile = await getDriverProfileForUser(user.id);
  return NextResponse.json({ profile });
}
