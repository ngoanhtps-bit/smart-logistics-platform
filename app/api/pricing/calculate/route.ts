import { NextResponse } from "next/server";
import { createQuote } from "@/lib/repositories/shipment.repository";
import { quoteSchema } from "@/lib/validators/quote";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`pricing:${ip}`, 30);
  if (!limited.ok) {
    return NextResponse.json({ message: "Quá nhiều yêu cầu, vui lòng thử lại sau" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const quote = await createQuote(parsed.data);
  const weightNum = parseFloat(parsed.data.weight) || 10;
  const surcharges = [
    weightNum > 25 ? { label: "Phụ phí tải trọng cao", amount: "1.5 triệu" } : null,
    /quá khổ/i.test(parsed.data.cargoType) ? { label: "Khảo sát hàng quá khổ", amount: "Liên hệ" } : null
  ].filter(Boolean);

  return NextResponse.json({
    ...quote,
    breakdown: {
      base: quote.estimatedPrice,
      surcharges,
      currency: "VND"
    },
    rulesApplied: ["route_pricing", "vehicle_type", "weight_tier"]
  });
}
