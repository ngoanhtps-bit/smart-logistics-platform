"use client";

import { useQuery } from "@tanstack/react-query";
import type { JourneyAction, JourneyStep } from "@/lib/shipment/workflow";
import type { Shipment, ShipmentOpsEvent } from "@/types/logistics";

export type ShipmentJourneyPayload = {
  shipment: Shipment;
  steps: JourneyStep[];
  events: ShipmentOpsEvent[];
  nextActions: JourneyAction[];
  statusMessage: string;
  progressPercent: number;
  role: string | null;
};

export function useShipmentJourney(code: string, enabled = true) {
  return useQuery({
    queryKey: ["shipment-journey", code],
    queryFn: async () => {
      const res = await fetch(`/api/shipments/${code}/journey`, { credentials: "include", cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Không tải hành trình");
      return json as ShipmentJourneyPayload;
    },
    enabled: Boolean(code) && enabled,
    refetchInterval: 15_000
  });
}
