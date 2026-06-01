"use client";

import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useLogisticsRealtimeSync } from "@/hooks/use-logistics-realtime-sync";

export function SyncStatusBadge() {
  const { connected, lastSyncAt, lastTrigger } = useLogisticsRealtimeSync(true);

  const ago =
    lastSyncAt != null
      ? `${Math.max(1, Math.round((Date.now() - lastSyncAt) / 1000))}s`
      : null;

  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold ${
        connected ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-600"
      }`}
      title={lastTrigger ? `Nguồn: ${lastTrigger}` : undefined}
    >
      {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
      <span>{connected ? "Đồng bộ live" : "Polling"}</span>
      {ago ? (
        <span className="flex items-center gap-1 text-slate-500">
          <RefreshCw size={12} /> {ago}
        </span>
      ) : null}
    </div>
  );
}
