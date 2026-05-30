"use client";

import { useShipments } from "@/hooks/use-shipments";
import { LogisticsMap } from "@/components/logistics-map";

export function DispatchMapLive() {
  const { data: shipments } = useShipments();
  const code =
    shipments?.find((s) => s.status === "in_transit")?.code ??
    shipments?.[0]?.code ??
    "SPL-260528-01";

  return <LogisticsMap shipmentCode={code} />;
}
