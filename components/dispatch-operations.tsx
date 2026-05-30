"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useFleet, useShipments } from "@/hooks/use-shipments";
import { shipmentNeedsAssign } from "@/lib/dispatch/shipment-assign";
import type { ShipmentStatus } from "@/types/logistics";

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

export function DispatchOperations() {
  const qc = useQueryClient();
  const { data: shipments } = useShipments();
  const { data: fleet } = useFleet();

  const [form, setForm] = useState({
    pickup: "Hải Phòng",
    delivery: "Bình Dương",
    cargoType: "Pallet",
    weight: "15 tấn",
    vehicleType: "Container 40FT",
    shipDate: new Date().toISOString().slice(0, 10)
  });
  const [assign, setAssign] = useState({
    code: "",
    driverName: "Nguyễn Văn Hải",
    driverPhone: "0901111222",
    vehiclePlate: "51H-888.66",
    vehicleType: "Mooc rào",
    status: "assigned" as ShipmentStatus
  });

  useEffect(() => {
    const first = shipments?.find((s) => s.status === "quoted") ?? shipments?.[0];
    if (first && !assign.code) {
      setAssign((a) => ({
        ...a,
        code: first.code,
        driverName: first.driver !== "Chưa gán" ? first.driver : a.driverName,
        vehiclePlate: first.vehiclePlate !== "—" ? first.vehiclePlate : a.vehiclePlate,
        vehicleType: first.vehicleType
      }));
    }
  }, [shipments, assign.code]);

  const createMut = useMutation({
    mutationFn: () => createOrder(form),
    onSuccess: (data: { code: string }) => {
      setAssign((a) => ({ ...a, code: data.code }));
      qc.invalidateQueries({ queryKey: ["shipments"] });
      qc.invalidateQueries({ queryKey: ["fleet"] });
      qc.invalidateQueries({ queryKey: ["marketplace"] });
    }
  });

  const assignMut = useMutation({
    mutationFn: () => assignOrder(assign.code, assign),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shipments"] });
      qc.invalidateQueries({ queryKey: ["fleet"] });
      qc.invalidateQueries({ queryKey: ["tracking", assign.code] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  const assignable =
    shipments?.filter((s) => shipmentNeedsAssign(s) || s.status === "quoted" || s.status === "draft") ?? [];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-black uppercase tracking-[0.12em] text-[#2563eb]">Thao tác điều phối</p>
      <h2 className="mt-1 text-2xl font-black text-[#102033]">Tạo đơn & gán xe</h2>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-4">
          <h3 className="flex items-center gap-2 font-black text-[#102033]">
            <Plus size={18} className="text-orange-600" /> Tạo đơn mới
          </h3>
          <div className="mt-4 grid gap-2">
            {(["pickup", "delivery", "cargoType", "weight", "vehicleType"] as const).map((key) => (
              <input
                key={key}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            ))}
          </div>
          <button className="btn-primary mt-4 w-full" type="button" disabled={createMut.isPending} onClick={() => createMut.mutate()}>
            {createMut.isPending ? <Loader2 className="animate-spin" size={18} /> : "Tạo đơn"}
          </button>
          {createMut.isSuccess ? (
            <p className="mt-2 text-sm font-bold text-green-700">Đã tạo: {(createMut.data as { code: string }).code}</p>
          ) : null}
          {createMut.isError ? (
            <p className="mt-2 text-xs font-bold text-red-600">{(createMut.error as Error).message}</p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-4">
          <h3 className="flex items-center gap-2 font-black text-[#102033]">
            <UserPlus size={18} className="text-[#2563eb]" /> Gán tài xế / xe
          </h3>
          <div className="mt-4 grid gap-2">
            <select
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
              value={assign.code}
              onChange={(e) => {
                const s = shipments?.find((x) => x.code === e.target.value);
                setAssign({
                  ...assign,
                  code: e.target.value,
                  driverName: s?.driver && s.driver !== "Chưa gán" ? s.driver : assign.driverName,
                  vehiclePlate: s?.vehiclePlate && s.vehiclePlate !== "—" ? s.vehiclePlate : assign.vehiclePlate
                });
              }}
            >
              <option value="">Chọn vận đơn</option>
              {assignable.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} — {s.route}
                </option>
              ))}
            </select>
            <select
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
              value={assign.vehiclePlate}
              onChange={(e) => {
                const v = fleet?.find((f) => f.plate === e.target.value);
                setAssign({
                  ...assign,
                  vehiclePlate: e.target.value,
                  vehicleType: v?.type ?? assign.vehicleType
                });
              }}
            >
              <option value="">Chọn xe từ đội</option>
              {fleet?.map((v) => (
                <option key={v.plate} value={v.plate}>
                  {v.plate} · {v.type} · {v.status}
                </option>
              ))}
            </select>
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
              placeholder="Tài xế"
              value={assign.driverName}
              onChange={(e) => setAssign({ ...assign, driverName: e.target.value })}
            />
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
              placeholder="SĐT tài xế"
              value={assign.driverPhone}
              onChange={(e) => setAssign({ ...assign, driverPhone: e.target.value })}
            />
            <select
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
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
          <button className="btn-secondary mt-4 w-full" type="button" disabled={!assign.code || assignMut.isPending} onClick={() => assignMut.mutate()}>
            {assignMut.isPending ? <Loader2 className="animate-spin" size={18} /> : "Gán chuyến"}
          </button>
          {assignMut.isError ? (
            <p className="mt-2 text-xs font-bold text-red-600">{(assignMut.error as Error).message} — cần đăng nhập điều phối.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
