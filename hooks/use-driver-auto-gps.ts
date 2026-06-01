"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";

const GPS_INTERVAL_MS = 4 * 60 * 1000;

async function sendGps(code: string) {
  const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15_000,
      maximumAge: 60_000
    });
  });
  const res = await fetch(`/api/tracking/${code}/gps`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      speed: pos.coords.speed ?? 45
    })
  });
  if (!res.ok) throw new Error("GPS failed");
  return res.json();
}

/** Tự gửi GPS mỗi 4 phút khi có chuyến đang chạy */
export function useDriverAutoGps(activeCode: string | undefined, enabled: boolean) {
  const lastSent = useRef(0);
  const gpsMut = useMutation({ mutationFn: (code: string) => sendGps(code) });

  useEffect(() => {
    if (!enabled || !activeCode || typeof navigator === "undefined") return;

    const tick = () => {
      if (document.visibilityState === "hidden") return;
      const now = Date.now();
      if (now - lastSent.current < GPS_INTERVAL_MS - 5000) return;
      lastSent.current = now;
      gpsMut.mutate(activeCode);
    };

    tick();
    const id = window.setInterval(tick, GPS_INTERVAL_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mutate stable enough per code
  }, [activeCode, enabled]);

  return {
    lastAutoGpsAt: lastSent.current || null,
    isSending: gpsMut.isPending,
    error: gpsMut.error as Error | null
  };
}
