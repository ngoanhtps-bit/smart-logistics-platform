"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, Loader2 } from "lucide-react";

type Analytics = {
  kpis: { label: string; value: string; trend: string }[];
  routeHeatmap: { route: string; revenue: number; trips: number }[];
  summary: { totalShipments: number; inTransit: number; delivered: number; onTimeRate: number };
  revenueByMonth: { month: string; value: number }[];
};

export function AnalyticsPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => fetch("/api/analytics").then((r) => r.json() as Promise<Analytics>)
  });

  if (isLoading) {
    return (
      <div className="flex gap-2 py-8 text-slate-500">
        <Loader2 className="animate-spin" /> Đang tải phân tích...
      </div>
    );
  }

  if (!data) return null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-xl font-black text-[#102033]">
        <BarChart3 className="text-[#2563eb]" /> Phân tích thời gian thực
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl bg-[#f8fafc] p-4">
          <p className="text-xs font-bold text-slate-500">Tổng vận đơn</p>
          <p className="text-2xl font-black">{data.summary.totalShipments}</p>
        </div>
        <div className="rounded-2xl bg-[#f8fafc] p-4">
          <p className="text-xs font-bold text-slate-500">Đang chạy</p>
          <p className="text-2xl font-black text-[#2563eb]">{data.summary.inTransit}</p>
        </div>
        <div className="rounded-2xl bg-[#f8fafc] p-4">
          <p className="text-xs font-bold text-slate-500">Đã giao</p>
          <p className="text-2xl font-black text-green-700">{data.summary.delivered}</p>
        </div>
        <div className="rounded-2xl bg-[#f8fafc] p-4">
          <p className="text-xs font-bold text-slate-500">Đúng giờ</p>
          <p className="text-2xl font-black">{data.summary.onTimeRate}%</p>
        </div>
      </div>
      <div className="mt-6">
        <p className="mb-3 text-sm font-black text-slate-600">Doanh thu theo tháng (tỷ)</p>
        <div className="flex items-end gap-2 h-32">
          {data.revenueByMonth.map((m) => (
            <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full rounded-t-lg bg-[#2563eb]" style={{ height: `${(m.value / 9) * 100}%` }} />
              <span className="text-xs font-bold text-slate-500">{m.month}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
