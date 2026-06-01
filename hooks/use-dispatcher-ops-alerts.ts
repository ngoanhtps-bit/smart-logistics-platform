"use client";

import { useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { playOpsChime, showBrowserNotification } from "@/lib/browser/notify";

const DRIVER_EVENTS = new Set(["driver_accepted", "driver_declined", "offer_sent"]);

/** Realtime: âm thanh + thông báo khi tài xế chốt / từ chối */
export function useDispatcherOpsAlerts(enabled: boolean) {
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("ops-event-alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "shipment_events" },
        (payload) => {
          const row = payload.new as {
            id?: string;
            event_type?: string;
            shipment_code?: string;
            message?: string;
          };
          if (!row.id || !row.event_type || !DRIVER_EVENTS.has(row.event_type)) return;
          if (seen.current.has(row.id)) return;
          seen.current.add(row.id);

          playOpsChime();

          const code = row.shipment_code ?? "";
          const isAccept = row.event_type === "driver_accepted";
          const isDecline = row.event_type === "driver_declined";

          if (isAccept || isDecline) {
            showBrowserNotification(isAccept ? `Tài xế đã chốt ${code}` : `Tài xế từ chối ${code}`, {
              body: row.message ?? "",
              tag: `evt-${row.id}`,
              data: { url: `/dispatcher?assign=${encodeURIComponent(code)}` }
            });
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled]);
}
