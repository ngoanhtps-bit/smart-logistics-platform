import { isSupabaseDataEnabled } from "@/lib/supabase/data-access";
import {
  isOperationalDbEnabled,
  supabaseInsertBid,
  supabaseListBids
} from "@/lib/supabase/operational-data";
import { createAppNotification } from "@/lib/notifications/app-notifications";
import { listShipments, patchShipment } from "@/lib/repositories/shipment.repository";

export type MarketplaceLoad = {
  id: string;
  code: string;
  route: string;
  cargo: string;
  weight: string;
  price: string;
  match: string;
  vehicle: string;
  pickupDate: string;
  status: "open" | "bidding" | "assigned";
  bids: { carrier: string; amount: string; eta: string }[];
};

const staticLoads: MarketplaceLoad[] = [
  {
    id: "ld1",
    code: "LD-HP-BD-884",
    route: "Hải Phòng → Bình Dương",
    cargo: "Pallet hàng kho",
    weight: "22 tấn",
    price: "24.8 triệu",
    match: "92%",
    vehicle: "Container 40FT",
    pickupDate: "30/05/2026",
    status: "open",
    bids: [{ carrier: "Đội xe A", amount: "24.2 triệu", eta: "3 ngày" }]
  }
];

const bidStore = new Map<string, MarketplaceLoad["bids"]>();

function estimatePrice(weight: string) {
  const w = parseFloat(weight) || 15;
  return `${(18 + w * 0.2).toFixed(1)} triệu`;
}

function bidsFromRows(
  code: string,
  rows: { carrier: string; amount: string; eta: string }[]
): MarketplaceLoad["bids"] {
  if (rows.length > 0) return rows;
  return bidStore.get(code) ?? [];
}

function shipmentToLoad(
  s: Awaited<ReturnType<typeof listShipments>>[number],
  bids: MarketplaceLoad["bids"]
): MarketplaceLoad {
  return {
    id: s.code,
    code: s.code,
    route: s.route,
    cargo: s.cargoType,
    weight: s.weight,
    price: estimatePrice(s.weight),
    match: `${Math.min(95, 75 + bids.length * 8)}%`,
    vehicle: s.vehicleType,
    pickupDate: new Date(s.createdAt).toLocaleDateString("vi-VN"),
    status: s.status === "assigned" ? "assigned" : bids.length > 0 ? "bidding" : "open",
    bids
  };
}

export async function listLoads(): Promise<MarketplaceLoad[]> {
  if (isSupabaseDataEnabled()) {
    const shipments = await listShipments();
    const open = shipments.filter((s) => s.status === "quoted" || s.status === "draft");
    if (open.length > 0) {
      const allBids = isOperationalDbEnabled() ? await supabaseListBids() : [];
      return open.map((s) => {
        const bids = bidsFromRows(
          s.code,
          allBids
            .filter((b) => b.shipment_code === s.code)
            .map((b) => ({ carrier: b.carrier, amount: b.amount, eta: b.eta }))
        );
        return shipmentToLoad(s, bids);
      });
    }
  }
  return staticLoads.map((l) => ({ ...l, bids: bidStore.get(l.id) ?? l.bids }));
}

export async function findLoad(id: string) {
  const loads = await listLoads();
  return loads.find((l) => l.id === id || l.code === id);
}

export async function placeBid(loadId: string, bid: { carrier: string; amount: string; eta: string }) {
  const load = await findLoad(loadId);
  if (!load) return null;

  if (isOperationalDbEnabled()) {
    await supabaseInsertBid({
      shipmentCode: load.code,
      carrier: bid.carrier,
      amount: bid.amount,
      eta: bid.eta
    });
    void createAppNotification({
      title: `Giá thầu mới — ${load.code}`,
      body: `${bid.carrier}: ${bid.amount} · ETA ${bid.eta}`,
      type: "info",
      shipmentCode: load.code
    });
    return findLoad(loadId);
  }

  const bids = [...(bidStore.get(loadId) ?? []), bid];
  bidStore.set(loadId, bids);
  return { ...load, bids, status: "bidding" as const };
}

export async function acceptLoad(loadId: string, bidIndex = 0) {
  const load = await findLoad(loadId);
  if (!load) return null;

  const bids = load.bids;
  const bid = bids[bidIndex];
  if (!bid && bids.length === 0) return null;

  if (isSupabaseDataEnabled()) {
    await patchShipment(load.code, {
      status: "assigned",
      driverName: bid?.carrier ?? "Đối tác vận tải",
      vehicleType: load.vehicle
    });
    void createAppNotification({
      title: `Đã chấp nhận giá thầu ${load.code}`,
      body: `Gán ${bid?.carrier ?? "đối tác"} · ${bid?.amount ?? ""}`,
      type: "success",
      shipmentCode: load.code
    });
  }

  bidStore.set(loadId, bids);
  return { ...load, status: "assigned" as const };
}
