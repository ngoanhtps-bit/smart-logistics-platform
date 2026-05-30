"use client";

import { Loader2 } from "lucide-react";
import { useFleet } from "@/hooks/use-shipments";

export function FleetLive() {
  const { data: fleet, isLoading } = useFleet();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-slate-500">
        <Loader2 className="animate-spin" size={18} /> Đang tải đội xe...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100">
      <div className="grid grid-cols-[0.85fr_0.8fr_1fr_1.1fr_0.8fr_0.6fr] bg-[#102033] px-4 py-3 text-xs font-black uppercase text-white">
        <span>Biển số</span>
        <span>Loại xe</span>
        <span>Tài xế</span>
        <span>Vị trí</span>
        <span>Trạng thái</span>
        <span>Công suất</span>
      </div>
      {fleet?.map((row) => (
        <div
          key={row.plate}
          className="grid grid-cols-[0.85fr_0.8fr_1fr_1.1fr_0.8fr_0.6fr] border-t border-slate-100 px-4 py-3 text-sm"
        >
          <span className="font-black text-[#102033]">{row.plate}</span>
          <span>{row.type}</span>
          <span>{row.driver}</span>
          <span className="text-slate-600">{row.location}</span>
          <span className="font-bold text-[#2563eb]">{row.status}</span>
          <span className="font-black text-green-700">{row.utilization}</span>
        </div>
      ))}
    </div>
  );
}
