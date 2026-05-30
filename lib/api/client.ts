import type { FleetVehicle, QuoteRequest, QuoteResponse, Shipment, TrackingSnapshot } from "@/types/logistics";

const nestBase = process.env.NEXT_PUBLIC_API_URL;
const nextBase = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const base = nestBase || nextBase;

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

const shipmentsPath = nestBase ? "/shipments" : "/api/shipments";

export const api = {
  getShipments: (opts?: { scope?: "mine" }) => {
    const q = opts?.scope === "mine" ? "?scope=mine" : "";
    return fetchJson<Shipment[]>(`${shipmentsPath}${q}`);
  },
  getShipment: (code: string) => fetchJson<Shipment>(`/api/shipments/${code}`),
  getTracking: (code: string) => fetchJson<TrackingSnapshot>(`/api/tracking/${code}`),
  getFleet: () => fetchJson<FleetVehicle[]>("/api/fleet"),
  createQuote: (body: QuoteRequest) =>
    fetchJson<QuoteResponse>("/api/quotes", { method: "POST", body: JSON.stringify(body) }),
  createShipment: (body: QuoteRequest) =>
    fetchJson<Shipment>(nestBase ? "/shipments" : "/api/shipments", { method: "POST", body: JSON.stringify(body) }),
  patchShipment: (code: string, body: Record<string, unknown>) =>
    fetchJson<Shipment>(nestBase ? `/shipments/${code}` : `/api/shipments/${code}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    })
};
