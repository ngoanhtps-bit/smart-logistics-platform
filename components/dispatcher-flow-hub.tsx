"use client";

import Link from "next/link";
import { AlertTriangle, Clock, Truck, UserPlus } from "lucide-react";
import { useMemo } from "react";
import { useShipments } from "@/hooks/use-shipments";
import { shipmentNeedsAssign, shipmentWaitingDriver } from "@/lib/dispatch/shipment-assign";
import { dispatcherControlUrl } from "@/lib/navigation/shipment-links";

export type DispatcherLane = "assign" | "waiting" | "running";

export function DispatcherFlowHub({
  onSelectLane,
  activeCode
}: {
  onSelectLane: (lane: DispatcherLane) => void;
  activeCode?: string | null;
}) {
  const { data: shipments } = useShipments({ refetchInterval: 12_000 });

  const counts = useMemo(() => {
    const list = shipments ?? [];
    return {
      needAssign: list.filter(shipmentNeedsAssign).length,
      waitingDriver: list.filter(shipmentWaitingDriver).length,
      running: list.filter(
        (s) => !["delivered", "cancelled", "quoted", "draft"].includes(s.status) && !shipmentWaitingDriver(s)
      ).length
    };
  }, [shipments]);

  const lanes: {
    id: DispatcherLane;
    label: string;
    desc: string;
    count: number;
    icon: typeof UserPlus;
    color: string;
  }[] = [
    {
      id: "assign",
      label: "Chờ gán xe",
      desc: "Tạo đơn · gợi ý tài xế · gửi chốt app",
      count: counts.needAssign,
      icon: UserPlus,
      color: "border-amber-200 bg-amber-50"
    },
    {
      id: "waiting",
      label: "Chờ tài xế chốt",
      desc: "Đã gửi app — theo dõi SLA",
      count: counts.waitingDriver,
      icon: Clock,
      color: "border-violet-200 bg-violet-50"
    },
    {
      id: "running",
      label: "Đang vận chuyển",
      desc: "Đổi trạng thái · nhật ký · GPS",
      count: counts.running,
      icon: Truck,
      color: "border-blue-200 bg-blue-50"
    }
  ];

  return (
    <section className="rounded-3xl border-2 border-[#2563eb]/25 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-[#2563eb]">Trung tâm điều phối</p>
          <h2 className="text-lg font-black text-[#102033]">Chọn luồng công việc</h2>
          <p className="mt-1 text-sm text-slate-600">
            Mỗi khu vực tách riêng — không trộn gán xe với điều khiển đang chạy.
          </p>
        </div>
        {activeCode ? (
          <Link
            href={dispatcherControlUrl(activeCode)}
            className="rounded-xl bg-[#102033] px-4 py-2 text-xs font-black text-white"
          >
            Đơn đang chọn: {activeCode}
          </Link>
        ) : null}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {lanes.map((lane) => {
          const Icon = lane.icon;
          return (
            <button
              key={lane.id}
              type="button"
              onClick={() => onSelectLane(lane.id)}
              className={`rounded-2xl border-2 p-4 text-left transition hover:ring-2 hover:ring-[#2563eb]/30 ${lane.color}`}
            >
              <div className="flex items-center justify-between">
                <Icon size={22} className="text-[#102033]" />
                <span className="text-2xl font-black text-[#102033]">{lane.count}</span>
              </div>
              <p className="mt-2 font-black text-[#102033]">{lane.label}</p>
              <p className="mt-1 text-xs font-semibold text-slate-600">{lane.desc}</p>
            </button>
          );
        })}
      </div>
      {counts.needAssign + counts.waitingDriver > 0 ? (
        <p className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-800">
          <AlertTriangle size={14} />
          Ưu tiên: {counts.waitingDriver > 0 ? "chờ chốt app" : "đơn chưa gán"} — bấm ô tương ứng phía trên
        </p>
      ) : null}
      <p className="mt-2 text-xs text-slate-500">
        Khách & tài xế thấy cùng mã đơn tại{" "}
        <Link href="/customer" className="font-bold text-[#2563eb]">
          Khách hàng
        </Link>{" "}
        /{" "}
        <Link href="/driver" className="font-bold text-orange-600">
          App tài xế
        </Link>
        {" "}
        · Chi tiết GPS:{" "}
        <Link href={activeCode ? `/tracking/${activeCode}` : "/tracking"} className="font-bold text-[#2563eb]">
          Theo dõi
        </Link>
      </p>
    </section>
  );
}
