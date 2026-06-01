"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Plus, Sparkles, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ListToolbar } from "@/components/list-toolbar";
import { useFleet, useShipments } from "@/hooks/use-shipments";
import { matchesSearch } from "@/lib/list-search";
import { offerBadgeClass, offerStatusLabels } from "@/lib/dispatch/offer-status";
import {
  canReassignShipment,
  isUnassignedDriver,
  isUnassignedVehicle,
  shipmentNeedsAssign,
  shipmentWaitingDriver
} from "@/lib/dispatch/shipment-assign";
import type { DriverSuggestion } from "@/lib/dispatch/suggest-drivers";
import { getShipmentSlaInfo, sortShipmentsBySla } from "@/lib/dispatch/sla";
import { invalidateShipmentFlow } from "@/lib/query/invalidate-shipments";
import type { RegisteredDriver, ShipmentStatus } from "@/types/logistics";

async function createOrder(body: Record<string, string>) {
  const res = await fetch("/api/shipments", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error("Tạo đơn thất bại");
  return res.json();
}

async function assignOrder(code: string, body: Record<string, string>) {
  const res = await fetch(`/api/shipments/${code}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? "Gán xe thất bại");
  }
  return res.json();
}

type FilterMode = "need_assign" | "waiting_driver" | "active" | "all";

export function DispatchCommandCenter({ initialAssignCode }: { initialAssignCode?: string | null }) {
  const qc = useQueryClient();
  const { data: shipments, isLoading, isError } = useShipments({ refetchInterval: 15_000 });
  const { data: fleet } = useFleet();

  const [filter, setFilter] = useState<FilterMode>("need_assign");
  const [search, setSearch] = useState("");
  const [selectedCode, setSelectedCode] = useState(initialAssignCode ?? "");
  const [msg, setMsg] = useState("");
  const [msgOk, setMsgOk] = useState(true);

  const [form, setForm] = useState({
    pickup: "Hải Phòng",
    delivery: "Bình Dương",
    cargoType: "Pallet",
    weight: "15 tấn",
    vehicleType: "Container 40FT"
  });

  const [targetDriverUserId, setTargetDriverUserId] = useState("");
  const [assign, setAssign] = useState({
    driverName: "",
    driverPhone: "",
    vehiclePlate: "",
    vehicleType: "",
    status: "assigned" as ShipmentStatus
  });

  const { data: registeredDrivers } = useQuery({
    queryKey: ["registered-drivers"],
    queryFn: async () => {
      const res = await fetch("/api/drivers/register", { credentials: "include" });
      const json = await res.json();
      return (json.drivers ?? []) as RegisteredDriver[];
    }
  });

  const pendingCount = useMemo(
    () => (shipments ?? []).filter(shipmentNeedsAssign).length,
    [shipments]
  );
  const waitingDriverCount = useMemo(
    () => (shipments ?? []).filter(shipmentWaitingDriver).length,
    [shipments]
  );
  const activeCount = useMemo(
    () =>
      (shipments ?? []).filter((s) => s.status !== "delivered" && s.status !== "cancelled").length,
    [shipments]
  );
  const freeFleet = useMemo(
    () => (fleet ?? []).filter((v) => v.status.includes("rỗng") || v.status.toLowerCase().includes("available")).length,
    [fleet]
  );

  const filteredList = useMemo(() => {
    let list = shipments ?? [];
    if (filter === "need_assign") list = list.filter(shipmentNeedsAssign);
    else if (filter === "waiting_driver") list = list.filter(shipmentWaitingDriver);
    else if (filter === "active")
      list = list.filter((s) => s.status !== "delivered" && s.status !== "cancelled");
    const q = search.trim();
    if (q) {
      list = list.filter((s) =>
        matchesSearch(q, [s.code, s.route, s.driver, s.vehiclePlate, s.statusLabel, s.cargoType])
      );
    }
    return sortShipmentsBySla(list);
  }, [shipments, filter, search]);

  const selected = useMemo(
    () => shipments?.find((s) => s.code === selectedCode),
    [shipments, selectedCode]
  );

  const { data: driverSuggestions, isFetching: suggestionsLoading } = useQuery({
    queryKey: ["suggest-drivers", selectedCode],
    queryFn: async () => {
      const res = await fetch(
        `/api/dispatcher/suggest-drivers?code=${encodeURIComponent(selectedCode)}`,
        { credentials: "include" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Không gợi ý được");
      return (json.suggestions ?? []) as DriverSuggestion[];
    },
    enabled: Boolean(selectedCode) && selected?.offerStatus !== "pending"
  });

  useEffect(() => {
    if (initialAssignCode) setSelectedCode(initialAssignCode);
  }, [initialAssignCode]);

  useEffect(() => {
    if (!selected && filteredList.length) {
      const first = filteredList.find(shipmentNeedsAssign) ?? filteredList[0];
      setSelectedCode(first.code);
    }
  }, [filteredList, selected]);

  useEffect(() => {
    if (!selected) return;
    const v = fleet?.find((f) => f.plate === selected.vehiclePlate && !isUnassignedVehicle(selected.vehiclePlate));
    setAssign({
      driverName: isUnassignedDriver(selected.driver) ? (v?.driver !== "—" ? v?.driver ?? "" : "") : selected.driver,
      driverPhone: selected.driverPhone || "",
      vehiclePlate: isUnassignedVehicle(selected.vehiclePlate) ? "" : selected.vehiclePlate,
      vehicleType: selected.vehicleType !== "—" ? selected.vehicleType : v?.type ?? "",
      status: selected.status === "draft" || selected.status === "quoted" ? "assigned" : selected.status
    });
  }, [selected, fleet]);

  const createMut = useMutation({
    mutationFn: () => createOrder(form),
    onSuccess: (data: { code: string }) => {
      setMsgOk(true);
      setMsg(`Đã tạo đơn ${data.code} — chọn bên dưới để gán xe.`);
      setSelectedCode(data.code);
      setFilter("need_assign");
      invalidateShipmentFlow(qc, data.code);
    },
    onError: (e) => {
      setMsgOk(false);
      setMsg((e as Error).message);
    }
  });

  const offerMut = useMutation({
    mutationFn: async (override?: {
      targetDriverUserId?: string;
      vehiclePlate?: string;
      vehicleType?: string;
    }) => {
      const res = await fetch("/api/dispatcher/offer-trip", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: selectedCode,
          targetDriverUserId: override?.targetDriverUserId ?? targetDriverUserId,
          vehiclePlate: override?.vehiclePlate ?? assign.vehiclePlate,
          vehicleType: override?.vehicleType ?? assign.vehicleType
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Gửi chuyến thất bại");
      return json;
    },
    onSuccess: (data: { message?: string }) => {
      setMsgOk(true);
      setMsg(data.message ?? "Đã gửi — tài xế chốt trên app.");
      invalidateShipmentFlow(qc, selectedCode);
    },
    onError: (e) => {
      setMsgOk(false);
      setMsg((e as Error).message);
    }
  });

  const cancelOfferMut = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/dispatcher/cancel-offer", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: selectedCode })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Hủy thất bại");
      return json;
    },
    onSuccess: (data: { message?: string }) => {
      setMsgOk(true);
      setMsg(data.message ?? "Đã hủy gửi chuyến.");
      invalidateShipmentFlow(qc, selectedCode);
    },
    onError: (e) => {
      setMsgOk(false);
      setMsg((e as Error).message);
    }
  });

  const assignMut = useMutation({
    mutationFn: () => assignOrder(selectedCode, assign),
    onSuccess: () => {
      setMsgOk(true);
      setMsg(`Đã gán nhanh (không qua app) ${assign.vehiclePlate} → ${selectedCode}.`);
      invalidateShipmentFlow(qc, selectedCode);
    },
    onError: (e) => {
      setMsgOk(false);
      setMsg((e as Error).message);
    }
  });

  function pickFleet(plate: string) {
    const v = fleet?.find((f) => f.plate === plate);
    setAssign({
      ...assign,
      vehiclePlate: plate,
      vehicleType: v?.type ?? assign.vehicleType,
      driverName: v && v.driver !== "—" ? v.driver : assign.driverName
    });
  }

  function pickRegisteredDriver(userId: string, d?: RegisteredDriver) {
    setTargetDriverUserId(userId);
    const driver = d ?? registeredDrivers?.find((x) => x.userId === userId);
    if (driver) {
      setAssign({
        ...assign,
        driverName: driver.name,
        driverPhone: driver.phone,
        vehiclePlate: driver.plate || assign.vehiclePlate,
        vehicleType: driver.vehicleType || assign.vehicleType
      });
    }
  }

  function quickOfferSuggestion(s: DriverSuggestion) {
    pickRegisteredDriver(s.userId, s);
    offerMut.mutate({
      targetDriverUserId: s.userId,
      vehiclePlate: s.plate || assign.vehiclePlate,
      vehicleType: s.vehicleType || assign.vehicleType
    });
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border-2 border-[#2563eb]/30 bg-gradient-to-br from-[#f0f7ff] to-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.12em] text-[#2563eb]">Trung tâm điều phối</p>
            <h2 className="mt-1 text-2xl font-black text-[#102033]">Gán xe & quản lý đơn</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Chọn đơn trong bảng → chọn xe từ đội → bấm <strong>Gán chuyến</strong>. Mọi đơn chưa có tài xế/biển số đều
              hiển thị ở đây (không chỉ đơn báo giá).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-xl bg-amber-100 px-4 py-2 text-sm font-black text-amber-900">
              {pendingCount} chờ gán
            </span>
            {waitingDriverCount > 0 ? (
              <span className="rounded-xl bg-violet-100 px-4 py-2 text-sm font-black text-violet-900">
                {waitingDriverCount} chờ tài xế chốt
              </span>
            ) : null}
            <span className="rounded-xl bg-blue-100 px-4 py-2 text-sm font-black text-blue-900">
              {activeCount} đang xử lý
            </span>
            <span className="rounded-xl bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-900">
              {freeFleet} xe rỗng
            </span>
          </div>
        </div>

        {msg ? (
          <p
            className={`mt-4 rounded-xl p-3 text-sm font-bold ${msgOk ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}
          >
            {msg}
          </p>
        ) : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-black text-[#102033]">Danh sách đơn</h3>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["need_assign", "Chờ gán xe"],
                  ["waiting_driver", `Chờ tài xế (${waitingDriverCount})`],
                  ["active", "Đang chạy"],
                  ["all", "Tất cả"]
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className={`rounded-xl px-3 py-2 text-sm font-bold ${
                    filter === id ? "bg-[#102033] text-white" : "border border-slate-200 text-slate-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <ListToolbar
            search={search}
            onSearchChange={setSearch}
            placeholder="Tìm mã SPL, tuyến, tài xế, biển số…"
            total={shipments?.length ?? 0}
            filtered={filteredList.length}
            selectedCount={0}
            allSelected={false}
            onSelectAll={() => {}}
            onClearSelection={() => {}}
          />

          {isLoading ? (
            <p className="flex items-center gap-2 py-8 text-slate-500">
              <Loader2 className="animate-spin" size={18} /> Đang tải đơn...
            </p>
          ) : isError ? (
            <p className="text-sm font-bold text-red-600">Không tải được đơn — kiểm tra Supabase / đăng nhập điều phối.</p>
          ) : filteredList.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
              {filter === "need_assign"
                ? "Không có đơn chờ gán — tạo đơn mới hoặc xem tab «Tất cả»."
                : "Không có đơn phù hợp bộ lọc."}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-[#102033] text-xs font-black uppercase text-white">
                  <tr>
                    <th className="px-4 py-3">SLA</th>
                    <th className="px-4 py-3">Mã đơn</th>
                    <th className="px-4 py-3">Tuyến</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Chốt app</th>
                    <th className="px-4 py-3">Tài xế</th>
                    <th className="px-4 py-3">Xe</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((s) => {
                    const need = shipmentNeedsAssign(s);
                    const waiting = shipmentWaitingDriver(s);
                    const isSelected = s.code === selectedCode;
                    const offerLabel = s.offerStatus ? offerStatusLabels[s.offerStatus] : "";
                    const sla = getShipmentSlaInfo(s);
                    return (
                      <tr
                        key={s.code}
                        className={`border-t border-slate-100 ${isSelected ? "bg-blue-50" : "bg-white hover:bg-slate-50"}`}
                      >
                        <td className="px-4 py-3">
                          {sla.label ? (
                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-black ${
                                sla.level === "critical"
                                  ? "bg-red-100 text-red-800"
                                  : sla.level === "warn"
                                    ? "bg-amber-100 text-amber-900"
                                    : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {sla.label}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-black text-[#102033]">{s.code}</td>
                        <td className="max-w-[200px] truncate px-4 py-3 font-semibold text-slate-600">{s.route}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-black ${
                              need ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {s.statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {offerLabel ? (
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-black ${offerBadgeClass(s.offerStatus)}`}
                            >
                              {offerLabel}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isUnassignedDriver(s.driver) && !waiting ? (
                            <span className="font-bold text-amber-600">Chưa gán</span>
                          ) : (
                            s.driver
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isUnassignedVehicle(s.vehiclePlate) ? (
                            <span className="font-bold text-amber-600">—</span>
                          ) : (
                            s.vehiclePlate
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            className={`rounded-lg px-3 py-1.5 text-xs font-black ${
                              isSelected ? "bg-[#2563eb] text-white" : "bg-orange-100 text-orange-800"
                            }`}
                            onClick={() => setSelectedCode(s.code)}
                          >
                            {isSelected ? "Đang chọn" : "Gán xe"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="grid gap-4">
          <section className="rounded-3xl border-2 border-orange-200 bg-orange-50/50 p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-black text-[#102033]">
              <UserPlus className="text-[#2563eb]" size={22} />
              Gửi chuyến cho tài xế (App)
            </h3>
            {!selectedCode ? (
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-amber-800">
                <AlertCircle size={16} /> Chọn một đơn trong bảng bên trái.
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm font-bold text-slate-600">
                  Đơn: <span className="text-[#102033]">{selectedCode}</span>
                  {selected ? ` · ${selected.route}` : null}
                </p>
                {selected?.offerStatus === "pending" ? (
                  <p className="mt-2 rounded-xl bg-violet-50 p-3 text-xs font-bold text-violet-900">
                    Đang chờ tài xế chốt trên app. Gán trực tiếp bị khóa cho đến khi hủy gửi chuyến.
                  </p>
                ) : null}
                {selected?.offerStatus === "accepted" && selected.driverReportPlate ? (
                  <p className="mt-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-900">
                    Tài xế đã chốt: {selected.driver} · BSX {selected.driverReportPlate}
                    {selected.driverReportPhone ? ` · ${selected.driverReportPhone}` : ""}
                    {selected.driverNote ? ` · ${selected.driverNote}` : ""}
                  </p>
                ) : null}
                {selected?.offerStatus === "declined" ? (
                  <p className="mt-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-800">
                    Tài xế đã từ chối — chọn tài xế khác và gửi chốt lại.
                  </p>
                ) : null}
                {selected?.offerStatus !== "pending" && (driverSuggestions?.length ?? 0) > 0 ? (
                  <div className="mt-4 rounded-2xl border border-[#2563eb]/20 bg-blue-50/60 p-3">
                    <p className="flex items-center gap-2 text-xs font-black uppercase text-[#2563eb]">
                      <Sparkles size={14} /> Gợi ý tài xế (1 nút gửi chốt)
                    </p>
                    <ul className="mt-2 grid gap-2">
                      {driverSuggestions!.slice(0, 3).map((s) => (
                        <li
                          key={s.userId}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-sm"
                        >
                          <div>
                            <span className="font-black text-[#102033]">{s.name}</span>
                            <span className="ml-2 text-xs font-bold text-emerald-700">+{s.score}</span>
                            <p className="text-xs text-slate-500">{s.reasons.join(" · ")}</p>
                          </div>
                          <button
                            type="button"
                            className="rounded-lg bg-[#2563eb] px-3 py-1.5 text-xs font-black text-white disabled:opacity-50"
                            disabled={offerMut.isPending || s.busy}
                            onClick={() => quickOfferSuggestion(s)}
                          >
                            Gửi chốt
                          </button>
                        </li>
                      ))}
                    </ul>
                    {suggestionsLoading ? (
                      <p className="mt-1 text-xs text-slate-500">Đang tính gợi ý...</p>
                    ) : null}
                  </div>
                ) : null}
                <div className="mt-4 grid gap-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Tài xế đăng ký app *</label>
                  <select
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold"
                    value={targetDriverUserId}
                    onChange={(e) => pickRegisteredDriver(e.target.value)}
                  >
                    <option value="">— Chọn tài xế (đã duyệt) —</option>
                    {(registeredDrivers ?? []).map((d) => (
                      <option key={d.userId} value={d.userId}>
                        {d.name} · {d.phone || d.email}
                        {d.plate ? ` · ${d.plate}` : ""}
                      </option>
                    ))}
                  </select>
                  {!registeredDrivers?.length ? (
                    <p className="text-xs text-amber-800">
                      Chưa có tài xế trong hệ thống — admin tạo/duyệt tài khoản role Tài xế.
                    </p>
                  ) : null}
                  <label className="text-xs font-bold uppercase text-slate-500">Xe gợi ý (tuỳ chọn)</label>
                  <select
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold"
                    value={assign.vehiclePlate}
                    onChange={(e) => pickFleet(e.target.value)}
                  >
                    <option value="">— Chọn biển số —</option>
                    {fleet?.map((v) => (
                      <option key={v.plate} value={v.plate}>
                        {v.plate} · {v.type} · {v.driver} · {v.status}
                      </option>
                    ))}
                  </select>
                  <input
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
                    placeholder="Tên tài xế *"
                    value={assign.driverName}
                    onChange={(e) => setAssign({ ...assign, driverName: e.target.value })}
                  />
                  <input
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
                    placeholder="SĐT tài xế"
                    value={assign.driverPhone}
                    onChange={(e) => setAssign({ ...assign, driverPhone: e.target.value })}
                  />
                  <input
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
                    placeholder="Loại xe"
                    value={assign.vehicleType}
                    onChange={(e) => setAssign({ ...assign, vehicleType: e.target.value })}
                  />
                  <label className="text-xs font-bold uppercase text-slate-500">Cập nhật trạng thái</label>
                  <select
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
                    value={assign.status}
                    onChange={(e) => setAssign({ ...assign, status: e.target.value as ShipmentStatus })}
                  >
                    <option value="assigned">Đã gán xe</option>
                    <option value="pickup">Đang lấy hàng</option>
                    <option value="loaded">Đã xếp hàng</option>
                    <option value="in_transit">Đang vận chuyển</option>
                    <option value="delivered">Đã giao</option>
                  </select>
                </div>
                {selected?.offerStatus === "pending" ? (
                  <button
                    className="btn-secondary mt-4 w-full"
                    type="button"
                    disabled={cancelOfferMut.isPending}
                    onClick={() => cancelOfferMut.mutate()}
                  >
                    {cancelOfferMut.isPending ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      "Hủy gửi chuyến (cho phép gán lại)"
                    )}
                  </button>
                ) : null}
                <button
                  className="btn-primary mt-4 w-full"
                  type="button"
                  disabled={!targetDriverUserId || offerMut.isPending || selected?.offerStatus === "pending"}
                  onClick={() => offerMut.mutate(undefined)}
                >
                  {offerMut.isPending ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <CheckCircle2 size={18} className="mr-1 inline" /> Gửi chốt — báo app tài xế
                    </>
                  )}
                </button>
                <p className="mt-2 text-center text-xs text-slate-500">
                  Tài xế nhận thông báo → vào /driver → Xác nhận / Từ chối → dữ liệu xe về đây.
                </p>
                <details className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                  <summary className="cursor-pointer text-sm font-bold text-slate-600">Gán nhanh (không qua app)</summary>
                  <div className="mt-3 grid gap-2">
                    <input
                      className="rounded-xl border px-3 py-2 text-sm font-semibold"
                      placeholder="Tên tài xế"
                      value={assign.driverName}
                      onChange={(e) => setAssign({ ...assign, driverName: e.target.value })}
                    />
                    <button
                      className="btn-secondary w-full"
                      type="button"
                      disabled={
                        !assign.vehiclePlate ||
                        !assign.driverName ||
                        assignMut.isPending ||
                        selected?.offerStatus === "pending"
                      }
                      onClick={() => assignMut.mutate()}
                    >
                      Gán trực tiếp
                    </button>
                  </div>
                </details>
                {selected && canReassignShipment(selected) ? (
                  <Link
                    href={`/tracking/${selectedCode}`}
                    className="mt-2 block text-center text-sm font-bold text-[#2563eb]"
                  >
                    Xem theo dõi →
                  </Link>
                ) : null}
              </>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 font-black text-[#102033]">
              <Plus size={18} className="text-orange-600" /> Tạo đơn nhanh
            </h3>
            <div className="mt-3 grid gap-2">
              {(["pickup", "delivery", "cargoType", "weight", "vehicleType"] as const).map((key) => (
                <input
                  key={key}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              ))}
            </div>
            <button
              className="btn-secondary mt-3 w-full"
              type="button"
              disabled={createMut.isPending}
              onClick={() => createMut.mutate()}
            >
              {createMut.isPending ? <Loader2 className="animate-spin" size={18} /> : "Tạo đơn mới"}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
