"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, MapPinned, MessageCircle, Navigation } from "lucide-react";
import { useState } from "react";
import { PodUpload } from "@/components/pod-upload";
import { useShipments } from "@/hooks/use-shipments";
import { api } from "@/lib/api/client";
import type { ShipmentStatus } from "@/types/logistics";

const statusActions: { key: ShipmentStatus; label: string }[] = [
  { key: "pickup", label: "Đã tới điểm lấy" },
  { key: "loaded", label: "Đã xếp hàng" },
  { key: "in_transit", label: "Đang vận chuyển" },
  { key: "delivered", label: "Đã giao hàng" }
];

export function DriverDashboard() {
  const qc = useQueryClient();
  const { data: shipments, isLoading } = useShipments({ mine: true });
  const [gpsMsg, setGpsMsg] = useState<string | null>(null);

  const active =
    shipments?.find((s) =>
      ["assigned", "pickup", "loaded", "in_transit"].includes(s.status)
    ) ?? shipments?.[0];

  const statusMut = useMutation({
    mutationFn: (status: ShipmentStatus) =>
      api.patchShipment(active!.code, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shipments"] });
      qc.invalidateQueries({ queryKey: ["tracking", active?.code] });
    }
  });

  const gpsMut = useMutation({
    mutationFn: async () => {
      if (!active) throw new Error("Không có chuyến");
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 12_000 });
      });
      const res = await fetch(`/api/tracking/${active.code}/gps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          speed: pos.coords.speed ?? 50
        })
      });
      if (!res.ok) throw new Error("Gửi GPS thất bại");
      return res.json();
    },
    onSuccess: () => {
      setGpsMsg("Đã gửi vị trí GPS lên Supabase");
      qc.invalidateQueries({ queryKey: ["tracking", active?.code] });
      qc.invalidateQueries({ queryKey: ["shipments"] });
    },
    onError: () => setGpsMsg("Không lấy được GPS — bật quyền vị trí trên trình duyệt")
  });

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-[#102033] to-[#1e3a5f] p-6 text-white">
        <p className="text-sm font-black uppercase tracking-[0.12em] text-orange-300">App tài xế</p>
        <h2 className="mt-2 text-2xl font-black">Chuyến đang được gán</h2>
        {isLoading ? (
          <Loader2 className="mt-4 animate-spin" />
        ) : active ? (
          <>
            <p className="mt-3 text-3xl font-black">{active.code}</p>
            <p className="mt-2 text-slate-300">{active.route}</p>
            <p className="mt-1 font-bold text-orange-300">
              {active.vehicleType} · {active.vehiclePlate}
            </p>
            <p className="mt-2 text-sm text-slate-400">{active.statusLabel}</p>
            <Link
              href={`/tracking/${active.code}`}
              className="mt-4 inline-block text-sm font-bold text-blue-300 hover:underline"
            >
              Mở tracking live →
            </Link>
          </>
        ) : (
          <p className="mt-4 text-slate-400">Chưa có chuyến — điều phối gán xe trước.</p>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <button className="btn-primary" type="button" disabled={!active}>
          <Navigation size={18} /> Mở GPS Navigation
        </button>
        <button className="btn-secondary" type="button">
          <MessageCircle size={18} /> Chat điều phối
        </button>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-black text-[#102033]">Cập nhật trạng thái</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {statusActions.map((action) => (
            <button
              key={action.key}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-left font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
              type="button"
              disabled={!active || statusMut.isPending}
              onClick={() => statusMut.mutate(action.key)}
            >
              {statusMut.isPending ? (
                <Loader2 className="animate-spin text-green-600" size={18} />
              ) : (
                <CheckCircle2 className="text-green-600" size={18} />
              )}
              {action.label}
            </button>
          ))}
        </div>
        {statusMut.isSuccess ? (
          <p className="mt-3 text-sm font-bold text-green-700">Đã cập nhật trạng thái trên Supabase</p>
        ) : null}
      </section>

      {active ? <PodUpload shipmentCode={active.code} /> : null}

      <button
        className="btn-ghost w-full"
        type="button"
        disabled={!active || gpsMut.isPending}
        onClick={() => gpsMut.mutate()}
      >
        {gpsMut.isPending ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <MapPinned size={18} />
        )}{" "}
        Gửi vị trí GPS (lưu Supabase)
      </button>
      {gpsMsg ? <p className="text-center text-sm font-semibold text-slate-600">{gpsMsg}</p> : null}
    </div>
  );
}
