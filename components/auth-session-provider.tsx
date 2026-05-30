"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const syncSession = useAuthStore((s) => s.syncSession);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    void syncSession();
    const onVisible = () => {
      if (document.visibilityState === "visible") void syncSession();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [syncSession]);

  if (!hydrated) return children;

  return children;
}
