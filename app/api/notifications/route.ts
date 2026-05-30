import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { listNotifications, markAllRead, markRead } from "@/lib/notifications-store";

export async function GET() {
  const user = await getSessionUser();
  const items = await listNotifications(user?.id ?? null);
  return NextResponse.json(items);
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (body.all === true) {
    await markAllRead();
    return NextResponse.json({ ok: true });
  }
  if (typeof body.id === "string") {
    await markRead(body.id);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ message: "Invalid body" }, { status: 400 });
}
