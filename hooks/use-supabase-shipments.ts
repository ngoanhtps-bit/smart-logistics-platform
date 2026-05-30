"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ShipmentRow = {
  code: string;
  status: string;
  pickup_location: string;
  delivery_location: string;
  updated_at: string;
};

export function useSupabaseShipmentsRealtime(enabled = true) {
  const [rows, setRows] = useState<ShipmentRow[]>([]);
  const [connected, setConnected] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const load = async () => {
      const { data, error } = await supabase
        .from("shipments")
        .select("code, status, pickup_location, delivery_location, updated_at")
        .order("updated_at", { ascending: false })
        .limit(10);
      if (error) {
        setQueryError(error.message);
        setRows([]);
        return;
      }
      setQueryError(null);
      if (data) setRows(data as ShipmentRow[]);
    };

    void load();

    const channel = supabase
      .channel("shipments-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "shipments" }, () => {
        void load();
      })
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled]);

  return { rows, connected, queryError, enabled: Boolean(createSupabaseBrowserClient()) };
}
