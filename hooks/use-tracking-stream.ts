"use client";

import { useEffect, useState } from "react";

type StreamPayload = {
  code: string;
  tick: number;
  progress: number;
  current: { latitude: number; longitude: number; speed: number };
  updatedAt: string;
};

export function useTrackingStream(code: string, enabled = true) {
  const [data, setData] = useState<StreamPayload | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !code) return;

    const es = new EventSource(`/api/tracking/${code}/stream`);

    es.onopen = () => setConnected(true);
    es.onmessage = (event) => {
      try {
        setData(JSON.parse(event.data) as StreamPayload);
      } catch {
        /* ignore */
      }
    };
    es.onerror = () => setConnected(false);

    return () => {
      es.close();
      setConnected(false);
    };
  }, [code, enabled]);

  return { data, connected };
}
