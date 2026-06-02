"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnalyticsPanel } from "@/components/analytics-panel";
import { DispatchActiveShipments } from "@/components/dispatch-active-shipments";
import { DispatchCommandCenter } from "@/components/dispatch-command-center";
import { DispatchMapLive } from "@/components/dispatch-map-live";
import { DispatchOrdersManager } from "@/components/dispatch-orders-manager";
import { DispatchPipelineLive } from "@/components/dispatch-pipeline-live";
import { DispatcherInvoices } from "@/components/dispatcher-invoices";
import { FleetLive } from "@/components/fleet-live";
import { DashboardKpisLive } from "@/components/dashboard-kpis-live";
import { DispatcherFlowHub, type DispatcherLane } from "@/components/dispatcher-flow-hub";
import { OperationsControlCenter } from "@/components/operations-control-center";

type BoardTab = "control" | "assign" | "fleet" | "pipeline" | "map" | "more";

function tabFromUrl(searchParams: URLSearchParams): BoardTab {
  const t = searchParams.get("tab");
  if (t === "assign" || t === "control" || t === "fleet" || t === "pipeline" || t === "map" || t === "more") {
    return t;
  }
  if (searchParams.get("assign")) return "assign";
  return "control";
}

function DispatchBoardInner() {
  const searchParams = useSearchParams();
  const assignFromUrl = searchParams.get("assign");
  const codeFromUrl = searchParams.get("code");
  const [tab, setTab] = useState<BoardTab>(() => tabFromUrl(searchParams));

  useEffect(() => {
    setTab(tabFromUrl(searchParams));
  }, [searchParams]);

  function selectLane(lane: DispatcherLane) {
    if (lane === "assign") setTab("assign");
    else if (lane === "waiting") setTab("assign");
    else setTab("control");
  }

  const tabs: { id: BoardTab; label: string; hint: string }[] = [
    { id: "control", label: "① Điều khiển", hint: "Đơn đang chạy · SLA" },
    { id: "assign", label: "② Gán & chốt", hint: "Gửi app tài xế" },
    { id: "fleet", label: "Đội xe", hint: "Xe rỗi" },
    { id: "pipeline", label: "Kanban", hint: "Tổng quan" },
    { id: "map", label: "Bản đồ", hint: "GPS" },
    { id: "more", label: "KPI", hint: "Báo cáo" }
  ];

  return (
    <div className="grid gap-6">
      <DispatcherFlowHub onSelectLane={selectLane} activeCode={assignFromUrl ?? codeFromUrl} />

      <div className="sticky top-0 z-10 -mx-1 rounded-2xl border border-slate-200 bg-white/95 px-1 py-2 shadow-sm backdrop-blur">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-xl px-4 py-2.5 text-sm font-black transition ${
                tab === t.id ? "bg-[#102033] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{t.label}</span>
              <span className="mt-0.5 block text-[10px] font-semibold opacity-80">{t.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {tab === "control" ? (
        <OperationsControlCenter initialCode={codeFromUrl ?? assignFromUrl} />
      ) : null}

      {tab === "assign" ? <DispatchCommandCenter initialAssignCode={assignFromUrl} /> : null}

      {tab === "fleet" ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-orange-600">Đội xe</p>
          <h2 className="mt-1 text-2xl font-black text-[#102033]">Xe và tài xế</h2>
          <p className="mt-1 text-sm text-slate-500">Chọn xe khi gán đơn ở tab «Gán xe & đơn».</p>
          <div className="mt-5">
            <FleetLive />
          </div>
        </section>
      ) : null}

      {tab === "pipeline" ? (
        <div className="grid gap-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.12em] text-[#2563eb]">Luồng xử lý</p>
            <h2 className="mt-1 text-2xl font-black text-[#102033]">Kanban theo trạng thái</h2>
            <p className="mt-1 text-sm text-slate-500">
              Cột «Chờ gán» — bấm mã đơn hoặc dùng tab Gán xe để gán tài xế.
            </p>
            <div className="mt-5">
              <DispatchPipelineLive linkAssignToDispatcher />
            </div>
          </section>
          <DispatchOrdersManager />
        </div>
      ) : null}

      {tab === "map" ? (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <DispatchMapLive />
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-[#102033]">Vận đơn đang chạy</h2>
            <DispatchActiveShipments />
          </section>
        </div>
      ) : null}

      {tab === "more" ? (
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-4">
            <DashboardKpisLive />
          </div>
          <DispatcherInvoices />
          <AnalyticsPanel />
        </div>
      ) : null}
    </div>
  );
}

export function DispatchBoard() {
  return (
    <Suspense fallback={<p className="font-bold text-slate-500">Đang tải bảng điều phối…</p>}>
      <DispatchBoardInner />
    </Suspense>
  );
}
