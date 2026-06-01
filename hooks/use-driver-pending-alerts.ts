"use client";

import { useEffect, useRef } from "react";
import { ensureNotificationPermission, showBrowserNotification } from "@/lib/browser/notify";

type Trip = { code: string; route: string };

/** Cảnh báo trình duyệt khi có chuyến mới chờ chốt */
export function useDriverPendingAlerts(pending: Trip[], enabled: boolean) {
  const seen = useRef<Set<string>>(new Set());
  const primed = useRef(false);

  useEffect(() => {
    if (!enabled || pending.length === 0) return;

    void ensureNotificationPermission();
  }, [enabled, pending.length]);

  useEffect(() => {
    if (!enabled) return;

    if (!primed.current) {
      pending.forEach((t) => seen.current.add(t.code));
      primed.current = true;
      return;
    }

    for (const trip of pending) {
      if (seen.current.has(trip.code)) continue;
      seen.current.add(trip.code);
      showBrowserNotification(`Chuyến cần chốt: ${trip.code}`, {
        body: trip.route,
        tag: `offer-${trip.code}`,
        data: { url: "/driver" }
      });
    }
  }, [pending, enabled]);
}
