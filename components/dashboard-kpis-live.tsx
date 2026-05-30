"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

type Kpi = { label: string; value: string; trend: string };

export function DashboardKpisLive({ scope }: { scope?: "mine" }) {
  const analyticsUrl = scope === "mine" ? "/api/analytics?scope=mine" : "/api/analytics";
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", scope ?? "all"],
    queryFn: () =>
      fetch(analyticsUrl).then((r) => r.json() as Promise<{ kpis: Kpi[]; summary?: { totalShipments: number; delivered: number; onTimeRate: number } }>)
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-slate-500 md:col-span-4">
        <Loader2 className="animate-spin" size={18} /> Đang tải KPI...
      </div>
    );
  }

  return (
    <>
      {(data?.kpis ?? []).map((kpi) => (
        <div key={kpi.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-bold text-slate-500">{kpi.label}</p>
          <p className="mt-3 text-3xl font-black text-[#102033] dark:text-white">{kpi.value}</p>
          <p className="mt-2 text-sm font-black text-green-700">{kpi.trend}</p>
        </div>
      ))}
    </>
  );
}
