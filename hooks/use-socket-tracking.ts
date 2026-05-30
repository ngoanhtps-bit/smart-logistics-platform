"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

type LocationPayload = {
  code: string;
  latitude: number;
  longitude: number;
  speed: number;
  progress: number;
  updatedAt: string;
};

export function useSocketTracking(code: string, enabled = true) {
  const [data, setData] = useState<LocationPayload | null>(null);
  const [connected, setConnected] = useState(false);
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;

  useEffect(() => {
    if (!enabled || !code || !wsUrl) return;

    let socket: Socket;
    try {
      socket = io(`${wsUrl}/tracking`, { transports: ["websocket", "polling"] });
      socket.on("connect", () => {
        setConnected(true);
        socket.emit("subscribe", code);
      });
      socket.on("disconnect", () => setConnected(false));
      socket.on("location_updated", (payload: LocationPayload) => setData(payload));
    } catch {
      setConnected(false);
    }

    return () => {
      socket?.disconnect();
      setConnected(false);
    };
  }, [code, enabled, wsUrl]);

  return { data, connected, enabled: Boolean(wsUrl) };
}
