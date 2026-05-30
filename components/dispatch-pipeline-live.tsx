"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useShipments } from "@/hooks/use-shipments";
import type { ShipmentStatus } from "@/types/logistics";

const columns: { key: ShipmentStatus[]; stage: string; color: string }[] = [
  { key: ["quoted", "draft"], stage: "Chờ gán / báo giá", color: "bg-slate-100 text-slate-700" },
  { key: ["assigned"], stage: "Đã gán xe", color: "bg-blue-50 text-blue-700" },
  { key: ["pickup", "loaded"], stage: "Lấy & xếp hàng", color: "bg-amber-50 text-amber-800" },
  { key: ["in_transit"], stage: "Đang chạy", color: "bg-orange-50 text-orange-700" },
  { key: ["delivered"], stage: "Đã giao", color: "bg-green-50 text-green-700" }
];

export function DispatchPipelineLive({ linkAssignToDispatcher = false }: { linkAssignToDispatcher?: boolean }) {
  const { data: shipments, isLoading } = useShipments();

  const pipeline = useMemo(() => {
    const list = shipments ?? [];
    return columns.map((col) => {
      const orders = list.filter((s) => col.key.includes(s.status));
      return { ...col, count: orders.length, orders };
    });
  }, [shipments]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-8 text-slate-500">
        <Loader2 className="animate-spin" size={18} /> Đang tải pipeline...
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-5">
      {pipeline.map((column) => (
        <article key={column.stage} className="rounded-3xl border border-slate-100 bg-[#f8fbff] p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-black text-[#102033]">{column.stage}</h3>
            <span className={`rounded-full px-3 py-1 text-xs font-black ${column.color}`}>{column.count}</span>
          </div>
          <div className="grid max-h-64 gap-2 overflow-y-auto">
            {column.orders.length === 0 ? (
              <p className="text-xs text-slate-400">—</p>
            ) : (
              column.orders.map((order) => (
                <div key={order.code} className="rounded-2xl bg-white p-3 shadow-sm">
                  <Link
                    href={`/tracking/${order.code}`}
                    className="text-sm font-bold text-slate-700 hover:text-[#2563eb]"
                  >
                    {order.code}
                  </Link>
                  <span className="mt-1 block text-xs font-semibold text-slate-500">{order.route}</span>
                  {linkAssignToDispatcher ? (
                    <Link
                      href={`/dispatcher?assign=${encodeURIComponent(order.code)}`}
                      className="mt-2 inline-block rounded-lg bg-orange-100 px-2 py-1 text-xs font-black text-orange-800"
                    >
                      Gán xe →
                    </Link>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
