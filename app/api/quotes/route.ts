import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { createAppNotification } from "@/lib/notifications/app-notifications";
import { createQuote } from "@/lib/repositories/shipment.repository";
import { quoteSchema } from "@/lib/validators/quote";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`quotes:${ip}`, 15);
  if (!limited.ok) {
    return NextResponse.json({ message: `Quá nhiều yêu cầu. Thử lại sau ${limited.retryAfter}s` }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = quoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dữ liệu không hợp lệ", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const quote = await createQuote(parsed.data);
    void createAppNotification({
      title: "Yêu cầu báo giá mới",
      body: `${parsed.data.pickup} → ${parsed.data.delivery} · ${quote.estimatedPrice}`,
      type: "info"
    });
    return NextResponse.json(quote, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Lỗi xử lý báo giá" }, { status: 500 });
  }
}
