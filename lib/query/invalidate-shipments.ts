import type { QueryClient } from "@tanstack/react-query";

/** Đồng bộ cache sau thao tác trên vận đơn — liền mạch admin / điều phối / tài xế / khách */
export function invalidateShipmentFlow(qc: QueryClient, code?: string) {
  qc.invalidateQueries({ queryKey: ["shipments"] });
  qc.invalidateQueries({ queryKey: ["operations-overview"] });
  qc.invalidateQueries({ queryKey: ["notifications"] });
  qc.invalidateQueries({ queryKey: ["driver-trips"] });
  qc.invalidateQueries({ queryKey: ["registered-drivers"] });
  qc.invalidateQueries({ queryKey: ["fleet"] });
  qc.invalidateQueries({ queryKey: ["analytics"] });
  qc.invalidateQueries({ queryKey: ["sync-verify"] });
  if (code) {
    qc.invalidateQueries({ queryKey: ["tracking", code] });
    qc.invalidateQueries({ queryKey: ["shipments", code] });
    qc.invalidateQueries({ queryKey: ["shipment-journey", code] });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("logistics-sync", { detail: { code } }));
    try {
      const bc = new BroadcastChannel("logistics-sync");
      bc.postMessage({ code });
      bc.close();
    } catch {
      /* ignore */
    }
  }
}
