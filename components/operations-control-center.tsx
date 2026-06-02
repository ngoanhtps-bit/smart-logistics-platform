"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ClipboardList,
  History,
  Loader2,
  MapPinned,
  Radio,
  RefreshCw,
  Send,
  Truck
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { offerBadgeClass, offerStatusLabels } from "@/lib/dispatch/offer-status";
import { eventTypeLabels } from "@/lib/operations/shipment-events";
import { getShipmentSlaInfo, sortShipmentsBySla } from "@/lib/dispatch/sla";
import { matchesSearch } from "@/lib/list-search";
import { ShipmentJourneyPanel } from "@/components/shipment-journey-panel";
import { invalidateShipmentFlow } from "@/lib/query/invalidate-shipments";
import type { Shipment, ShipmentOpsEvent, ShipmentStatus } from "@/types/logistics";

type OpsPayload = {
  overview: {
    counts: Record<string, number>;
    alerts: { level: string; code: string; message: string; href?: string }[];
  };
  recentEvents: ShipmentOpsEvent[];
  shipments: Shipment[];
};

const statusOptions: { value: ShipmentStatus; label: string }[] = [
  { value: "quoted", label: "Báo giá" },
  { value: "assigned", label: "Đã gán" },
  { value: "pickup", label: "Lấy hàng" },
  { value: "loaded", label: "Xếp hàng" },
  { value: "in_transit", label: "Đang chạy" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Hủy" }
];

type ListFilter = "all" | "active" | "waiting" | "problem";

async function fetchOps() {
  const res = await fetch("/api/operations/overview", { credentials: "include", cache: "no-store" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Không tải được trung tâm điều khiển");
  return json as OpsPayload;
}

export function OperationsControlCenter({ initialCode }: { initialCode?: string | null }) {
  const qc = useQueryClient();
  const [selectedCode, setSelectedCode] = useState(initialCode ?? "");
  const [search, setSearch] = useState("");
  const [listFilter, setListFilter] = useState<ListFilter>("active");
  const [note, setNote] = useState("");
  const [newStatus, setNewStatus] = useState<ShipmentStatus>("in_transit");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (initialCode) setSelectedCode(initialCode);
  }, [initialCode]);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["operations-overview"],
    queryFn: fetchOps,
    refetchInterval: 12_000
  });

  const shipments = data?.shipments ?? [];
  const counts = data?.overview.counts;

  const filtered = useMemo(() => {
    let list = shipments;
    if (listFilter === "active") {
      list = list.filter((s) => !["delivered", "cancelled"].includes(s.status));
    } else if (listFilter === "waiting") {
      list = list.filter((s) => s.offerStatus === "pending");
    } else if (listFilter === "problem") {
      list = list.filter(
        (s) => s.offerStatus === "declined" || s.status === "cancelled" || s.driver === "Chưa gán"
      );
    }
    const q = search.trim();
    if (q) {
      list = list.filter((s) =>
        matchesSearch(q, [s.code, s.route, s.driver, s.vehiclePlate, s.statusLabel, s.offerStatus ?? ""])
      );
    }
    return sortShipmentsBySla(list);
  }, [shipments, listFilter, search]);

  const selected = useMemo(
    () => shipments.find((s) => s.code === selectedCode) ?? filtered[0],
    [shipments, selectedCode, filtered]
  );

  const shipmentEvents = useMemo(() => {
    if (!selected) return data?.recentEvents ?? [];
    const code = selected.code;
    return (data?.recentEvents ?? []).filter((e) => e.shipmentCode === code);
  }, [data?.recentEvents, selected]);

  const statusMut = useMutation({
    mutationFn: async (status: ShipmentStatus) => {
      const res = await fetch(`/api/shipments/${selected!.code}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Cập nhật thất bại");
      return json;
    },
    onSuccess: () => {
      setMsg("Đã cập nhật trạng thái.");
      invalidateShipmentFlow(qc, selected?.code);
    },
    onError: (e) => setMsg((e as Error).message)
  });

  const noteMut = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/operations/note", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: selected!.code, note })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Ghi chú thất bại");
      return json;
    },
    onSuccess: () => {
      setNote("");
      setMsg("Đã ghi nhật ký điều khiển.");
      invalidateShipmentFlow(qc, selected?.code);
    },
    onError: (e) => setMsg((e as Error).message)
  });

  const statCards = counts
    ? [
        { label: "Đang vận hành", value: counts.active, color: "bg-blue-50 text-blue-900" },
        { label: "Chờ tài xế chốt", value: counts.waitingDriver, color: "bg-violet-50 text-violet-900" },
        { label: "Chờ gán xe", value: counts.needsAssign, color: "bg-amber-50 text-amber-900" },
        { label: "Đang chạy", value: counts.inTransit, color: "bg-orange-50 text-orange-900" },
        { label: "Từ chối / lỗi", value: counts.declined, color: "bg-red-50 text-red-800" },
        { label: "Đã giao", value: counts.delivered, color: "bg-emerald-50 text-emerald-900" }
      ]
    : [];

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 py-12 text-slate-500">
        <Loader2 className="animate-spin" size={20} /> Đang tải trung tâm điều khiển…
      </p>
    );
  }

  if (error) {
    return (
      <p className="rounded-2xl bg-red-50 p-6 text-sm font-bold text-red-700">
        {(error as Error).message}. Kiểm tra đăng nhập điều phối/admin và SQL 020.
      </p>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border-2 border-[#102033]/20 bg-gradient-to-br from-[#102033] to-[#1a3a5c] p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-orange-300">
              <Radio size={16} /> Trung tâm điều khiển
            </p>
            <h2 className="mt-1 text-2xl font-black">Vận hành thời gian thực</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Theo dõi toàn bộ đơn, cảnh báo, nhật ký sự kiện và điều khiển trạng thái từ một màn hình.
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-bold hover:bg-white/25"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} /> Làm mới
          </button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {statCards.map((c) => (
            <div key={c.label} className={`rounded-2xl px-4 py-3 ${c.color}`}>
              <p className="text-xs font-black uppercase opacity-80">{c.label}</p>
              <p className="text-2xl font-black">{c.value}</p>
            </div>
          ))}
        </div>
      </section>

      {(data?.overview.alerts.length ?? 0) > 0 ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-black text-amber-900">
            <AlertTriangle size={18} /> Cảnh báo cần xử lý
          </p>
          <ul className="grid gap-2">
            {data!.overview.alerts.map((a) => (
              <li key={`${a.code}-${a.message}`}>
                <Link
                  href={a.href ?? "#"}
                  className="block rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#102033] hover:bg-amber-100"
                  onClick={() => setSelectedCode(a.code)}
                >
                  {a.message}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-black text-[#102033]">
              <ClipboardList size={20} /> Danh sách điều khiển
            </h3>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["active", "Đang chạy"],
                  ["waiting", "Chờ chốt"],
                  ["problem", "Cần xử lý"],
                  ["all", "Tất cả"]
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setListFilter(id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-black ${
                    listFilter === id ? "bg-[#102033] text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <input
            className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
            placeholder="Tìm mã SPL, tuyến, tài xế…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-[420px] space-y-2 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">Không có đơn phù hợp.</p>
            ) : (
              filtered.map((s) => {
                const sla = getShipmentSlaInfo(s);
                return (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => {
                    setSelectedCode(s.code);
                    setNewStatus(s.status);
                    setMsg("");
                  }}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selected?.code === s.code
                      ? "border-[#2563eb] bg-blue-50"
                      : "border-slate-100 bg-[#f8fafc] hover:border-slate-200"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-black text-[#102033]">{s.code}</span>
                    <div className="flex flex-wrap gap-1">
                      {sla.label ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                            sla.level === "critical"
                              ? "bg-red-100 text-red-800"
                              : sla.level === "warn"
                                ? "bg-amber-100 text-amber-900"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {sla.label}
                        </span>
                      ) : null}
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-black text-slate-700">
                        {s.statusLabel}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-600">{s.route}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {s.driver} · {s.vehiclePlate}
                  </p>
                  {s.offerStatus && s.offerStatus !== "none" ? (
                    <span
                      className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-black ${offerBadgeClass(s.offerStatus)}`}
                    >
                      {offerStatusLabels[s.offerStatus]}
                    </span>
                  ) : null}
                </button>
              );
              })
            )}
          </div>
        </section>

        <div className="grid gap-4">
          <section className="rounded-3xl border-2 border-[#2563eb]/30 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 font-black text-[#102033]">
              <Truck size={20} className="text-[#2563eb]" /> Bảng điều khiển đơn
            </h3>
            {!selected ? (
              <p className="mt-4 text-sm text-slate-500">Chọn một đơn bên trái.</p>
            ) : (
              <>
                <p className="mt-3 text-2xl font-black">{selected.code}</p>
                <p className="text-sm font-semibold text-slate-600">{selected.route}</p>
                <dl className="mt-4 grid gap-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="font-bold text-slate-500">Tài xế</dt>
                    <dd className="font-black text-[#102033]">{selected.driver}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="font-bold text-slate-500">Xe / BSX</dt>
                    <dd className="font-black">{selected.vehiclePlate}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="font-bold text-slate-500">Hàng</dt>
                    <dd>
                      {selected.cargoType} · {selected.weight}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="font-bold text-slate-500">ETA</dt>
                    <dd>{selected.eta}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/tracking/${selected.code}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-blue-100 px-3 py-2 text-xs font-black text-blue-900"
                  >
                    <MapPinned size={14} /> Tracking
                  </Link>
                  <Link
                    href={`/dispatcher?assign=${encodeURIComponent(selected.code)}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-orange-100 px-3 py-2 text-xs font-black text-orange-900"
                  >
                    Gán xe →
                  </Link>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <label className="text-xs font-black uppercase text-slate-500">Điều khiển trạng thái</label>
                  <div className="mt-2 flex gap-2">
                    <select
                      className="flex-1 rounded-xl border px-3 py-2 text-sm font-semibold"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
                    >
                      {statusOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn-primary shrink-0"
                      disabled={statusMut.isPending}
                      onClick={() => statusMut.mutate(newStatus)}
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-black uppercase text-slate-500">Ghi chú điều khiển</label>
                  <div className="mt-2 flex gap-2">
                    <input
                      className="flex-1 rounded-xl border px-3 py-2 text-sm"
                      placeholder="VD: Khách yêu cầu giao sớm 2h…"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-secondary shrink-0"
                      disabled={!note.trim() || noteMut.isPending}
                      onClick={() => noteMut.mutate()}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
                {msg ? <p className="mt-3 text-xs font-bold text-slate-600">{msg}</p> : null}
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <ShipmentJourneyPanel code={selected.code} compact />
                </div>
              </>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-[#f8fafc] p-5">
            <h3 className="flex items-center gap-2 text-sm font-black text-[#102033]">
              <History size={18} /> Nhật ký sự kiện
              {selected ? ` · ${selected.code}` : ""}
            </h3>
            <ul className="mt-4 max-h-56 space-y-2 overflow-y-auto">
              {shipmentEvents.length === 0 ? (
                <li className="text-xs text-slate-500">
                  Chưa có sự kiện — chạy SQL 020 hoặc thao tác gán/chốt chuyến.
                </li>
              ) : (
                shipmentEvents.map((ev) => (
                  <li key={ev.id} className="rounded-xl bg-white px-3 py-2 text-xs shadow-sm">
                    <span className="font-black text-[#2563eb]">
                      {eventTypeLabels[ev.eventType] ?? ev.eventType}
                    </span>
                    <p className="mt-0.5 font-semibold text-slate-700">{ev.message}</p>
                    <p className="mt-1 text-slate-400">
                      {new Date(ev.createdAt).toLocaleString("vi-VN")}
                      {ev.actorRole ? ` · ${ev.actorRole}` : ""}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <h3 className="font-black text-[#102033]">Luồng sự kiện toàn hệ thống (mới nhất)</h3>
        <ul className="mt-4 grid gap-2 md:grid-cols-2">
          {(data?.recentEvents ?? []).slice(0, 12).map((ev) => (
            <li
              key={ev.id}
              className="cursor-pointer rounded-xl border border-slate-100 p-3 hover:bg-slate-50"
              onClick={() => setSelectedCode(ev.shipmentCode)}
            >
              <span className="text-xs font-black text-[#102033]">{ev.shipmentCode}</span>
              <span className="mx-2 text-slate-300">·</span>
              <span className="text-xs font-bold text-[#2563eb]">{eventTypeLabels[ev.eventType]}</span>
              <p className="mt-1 text-sm text-slate-600">{ev.message}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
