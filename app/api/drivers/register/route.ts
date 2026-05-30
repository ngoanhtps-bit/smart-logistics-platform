import { NextResponse } from "next/server";
import { requireApiRoles } from "@/lib/auth/api-guard";
import { listRegisteredDrivers } from "@/lib/driver/trips";

export async function GET() {
  const { error } = await requireApiRoles(["dispatcher", "admin"]);
  if (error) return error;
  const drivers = await listRegisteredDrivers();
  return NextResponse.json({ drivers });
}
