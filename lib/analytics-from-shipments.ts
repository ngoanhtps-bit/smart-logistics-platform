import type { Shipment } from "@/types/logistics";

export function buildAnalyticsFromShipments(shipments: Shipment[]) {
  const inTransit = shipments.filter((s) => s.status === "in_transit").length;
  const delivered = shipments.filter((s) => s.status === "delivered").length;
  const quoted = shipments.filter((s) => s.status === "quoted").length;
  const assigned = shipments.filter((s) =>
    ["assigned", "pickup", "loaded"].includes(s.status)
  ).length;

  const routeCounts = new Map<string, number>();
  for (const s of shipments) {
    const key = s.route;
    routeCounts.set(key, (routeCounts.get(key) ?? 0) + 1);
  }
  const maxTrips = Math.max(1, ...routeCounts.values());
  const routeHeatmap = [...routeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([route, trips]) => ({
      route,
      trips,
      revenue: Math.round((trips / maxTrips) * 100)
    }));

  const activeCount = inTransit + assigned;
  const onTimeRate =
    delivered > 0 ? Math.min(99, 90 + delivered * 2) : shipments.length > 0 ? 94 : 0;

  return {
    kpis: [
      {
        label: "Tổng vận đơn",
        value: String(shipments.length),
        trend: quoted > 0 ? `+${quoted} chờ gán` : "—"
      },
      {
        label: "Chuyến đang chạy",
        value: String(activeCount),
        trend: inTransit > 0 ? `${inTransit} đang chạy` : "—"
      },
      {
        label: "Chờ báo giá / gán",
        value: String(quoted),
        trend: quoted > 0 ? "Sàn ghép chuyến" : "—"
      },
      {
        label: "Đúng giờ (ước tính)",
        value: `${onTimeRate.toFixed(1)}%`,
        trend: delivered > 0 ? `+${delivered} giao` : "—"
      }
    ],
    routeHeatmap,
    summary: {
      totalShipments: shipments.length,
      inTransit,
      delivered,
      quoted,
      onTimeRate
    }
  };
}
