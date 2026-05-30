import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireApiRoles } from "@/lib/auth/api-guard";
import { deleteRoute, listAdminRoutes, updateRoutePricing, upsertRoute } from "@/lib/cms/routes";

export async function GET() {
  const { error } = await requireApiRoles(["admin"]);
  if (error) return error;
  return NextResponse.json(await listAdminRoutes());
}

export async function POST(request: Request) {
  const { error } = await requireApiRoles(["admin"]);
  if (error) return error;

  try {
    const body = await request.json();
    const route = await upsertRoute(body);
    revalidatePath(`/tuyen/${route.slug}`);
    revalidatePath("/bang-gia");
    return NextResponse.json(route, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: (e as Error).message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const { error } = await requireApiRoles(["admin"]);
  if (error) return error;

  try {
    const body = await request.json();
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ message: "Thiếu id tuyến" }, { status: 400 });

    const route = await updateRoutePricing(id, {
      container20: String(body.container20 ?? ""),
      container40: String(body.container40 ?? ""),
      transitDays: String(body.transitDays ?? ""),
      fromCity: body.fromCity ? String(body.fromCity) : undefined,
      toCity: body.toCity ? String(body.toCity) : undefined
    });

    revalidatePath(`/tuyen/${route.slug}`);
    revalidatePath("/bang-gia");
    return NextResponse.json(route);
  } catch (e) {
    return NextResponse.json({ message: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { error } = await requireApiRoles(["admin"]);
  if (error) return error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ message: "Thiếu id" }, { status: 400 });

  try {
    await deleteRoute(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ message: (e as Error).message }, { status: 400 });
  }
}
