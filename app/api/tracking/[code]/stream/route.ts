import { getTrackingSnapshot } from "@/lib/repositories/shipment.repository";

type Props = { params: Promise<{ code: string }> };

export async function GET(request: Request, { params }: Props) {
  const { code } = await params;
  const tracking = await getTrackingSnapshot(code);
  if (!tracking) {
    return new Response("Not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  let tick = 0;

  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        tick += 1;
        const progress = Math.min(0.98, 0.12 + tick * 0.02);
        const lat = tracking.current.latitude + tick * 0.02;
        const lng = tracking.current.longitude + tick * 0.015;
        const payload = {
          code,
          tick,
          progress,
          current: { ...tracking.current, latitude: lat, longitude: lng, speed: 58 + (tick % 5) },
          updatedAt: new Date().toISOString()
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      send();
      const interval = setInterval(send, 15_000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
