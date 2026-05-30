import { NextResponse } from "next/server";
import { requireApiRoles } from "@/lib/auth/api-guard";
import {
  deleteVehicleCategory,
  listVehicleCategories,
  upsertVehicleCategory
} from "@/lib/cms/vehicle-categories";

export async function GET() {
  const { error } = await requireApiRoles(["admin"]);
  if (error) return error;
  return NextResponse.json(await listVehicleCategories(true));
}

export async function POST(request: Request) {
  const { error } = await requireApiRoles(["admin"]);
  if (error) return error;

  try {
    const body = await request.json();
    const vehicle = await upsertVehicleCategory(body);
    return NextResponse.json(vehicle, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { error } = await requireApiRoles(["admin"]);
  if (error) return error;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "Thiếu id" }, { status: 400 });
  }

  try {
    await deleteVehicleCategory(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ message: (e as Error).message }, { status: 400 });
  }
}
