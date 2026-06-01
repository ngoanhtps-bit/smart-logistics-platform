"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { invalidateShipmentFlow } from "@/lib/query/invalidate-shipments";

const SYNC_EVENT = "logistics-sync";
const BC_NAME = "logistics-sync";

function emitLocalSync(code?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { code } }));
  try {
    const bc = new BroadcastChannel(BC_NAME);
    bc.postMessage({ code });
    bc.close();
  } catch {
    /* ignore */
  }
}

/** Gọi sau mỗi thao tác — đồng bộ tab + vai trò trên cùng trình duyệt */
export function broadcastLogisticsSync(code?: string) {
  emitLocalSync(code);
}

export function useLogisticsRealtimeSync(enabled = true) {
  const qc = useQueryClient();
  const [connected, setConnected] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const [lastTrigger, setLastTrigger] = useState<string | null>(null);

  const refresh = useCallback(
    (source: string, code?: string) => {
      setLastSyncAt(Date.now());
      setLastTrigger(source);
      invalidateShipmentFlow(qc, code);
      qc.invalidateQueries({ queryKey: ["analytics"] });
      qc.invalidateQueries({ queryKey: ["sync-verify"] });
    },
    [qc]
  );

  useEffect(() => {
    if (!enabled) return;

    const onLocal = (e: Event) => {
      const code = (e as CustomEvent<{ code?: string }>).detail?.code;
      refresh("local", code);
    };
    window.addEventListener(SYNC_EVENT, onLocal);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(BC_NAME);
      bc.onmessage = (msg) => refresh("tab", msg.data?.code);
    } catch {
      bc = null;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      return () => {
        window.removeEventListener(SYNC_EVENT, onLocal);
        bc?.close();
      };
    }

    const channel = supabase
      .channel("logistics-global-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "shipments" }, (payload) => {
        const row = (payload.new ?? payload.old) as { code?: string } | undefined;
        refresh("realtime:shipments", row?.code);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "shipment_events" }, (payload) => {
        const row = payload.new as { shipment_code?: string } | undefined;
        refresh("realtime:events", row?.shipment_code);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "app_notifications" }, () => {
        refresh("realtime:notifications");
      })
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      window.removeEventListener(SYNC_EVENT, onLocal);
      bc?.close();
      void supabase.removeChannel(channel);
    };
  }, [enabled, refresh]);

  return { connected, lastSyncAt, lastTrigger };
}
