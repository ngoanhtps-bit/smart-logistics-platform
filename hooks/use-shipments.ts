"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function useShipments(opts?: { mine?: boolean; refetchInterval?: number }) {
  const scope = opts?.mine ? "mine" : "all";
  return useQuery({
    queryKey: ["shipments", scope],
    queryFn: () => api.getShipments(opts?.mine ? { scope: "mine" } : undefined),
    refetchInterval: opts?.refetchInterval
  });
}

export function useShipment(code: string) {
  return useQuery({
    queryKey: ["shipments", code],
    queryFn: () => api.getShipment(code),
    enabled: Boolean(code)
  });
}

export function useTracking(code: string, refetchInterval = 20_000) {
  return useQuery({
    queryKey: ["tracking", code],
    queryFn: () => api.getTracking(code),
    enabled: Boolean(code),
    refetchInterval
  });
}

export function useFleet() {
  return useQuery({
    queryKey: ["fleet"],
    queryFn: () => api.getFleet(),
    refetchInterval: 30_000
  });
}
