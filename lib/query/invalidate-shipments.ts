import type { QueryClient } from "@tanstack/react-query";

/** Đồng bộ cache sau thao tác trên vận đơn — luồng liền mạch giữa các màn hình */
export function invalidateShipmentFlow(qc: QueryClient, code?: string) {
  qc.invalidateQueries({ queryKey: ["shipments"] });
  qc.invalidateQueries({ queryKey: ["operations-overview"] });
  qc.invalidateQueries({ queryKey: ["notifications"] });
  qc.invalidateQueries({ queryKey: ["driver-trips"] });
  qc.invalidateQueries({ queryKey: ["registered-drivers"] });
  qc.invalidateQueries({ queryKey: ["fleet"] });
  if (code) {
    qc.invalidateQueries({ queryKey: ["tracking", code] });
    qc.invalidateQueries({ queryKey: ["shipments", code] });
    qc.invalidateQueries({ queryKey: ["shipment-journey", code] });
  }
}
