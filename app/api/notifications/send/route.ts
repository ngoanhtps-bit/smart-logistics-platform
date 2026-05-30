import { NextResponse } from "next/server";
import { dispatchNotification, listNotificationLogs } from "@/lib/notification-hub";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function GET() {
  return NextResponse.json(listNotificationLogs());
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`notify-send:${ip}`, 10);
  if (!limited.ok) {
    return NextResponse.json({ message: "Rate limited" }, { status: 429 });
  }

  const body = await request.json();
  const log = await dispatchNotification({
    channel: body.channel,
    to: body.to,
    title: body.title,
    body: body.body,
    meta: body.meta
  });
  return NextResponse.json(log, { status: 201 });
}
