"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthSessionProvider } from "@/components/auth-session-provider";
import { LogisticsSyncEffects } from "@/components/logistics-sync-effects";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSessionProvider>
        <LogisticsSyncEffects />
        {children}
      </AuthSessionProvider>
    </QueryClientProvider>
  );
}
