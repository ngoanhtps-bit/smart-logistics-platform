"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Loader2, MapPinned, Navigation } from "lucide-react";
import { ShipmentJourneyPanel } from "@/components/shipment-journey-panel";
import { PodUpload } from "@/components/pod-upload";
import { useDriverAutoGps } from "@/hooks/use-driver-auto-gps";
import { mapsDirectionsUrl } from "@/lib/maps/navigation";
import { api } from "@/lib/api/client";
import { invalidateShipmentFlow } from "@/lib/query/invalidate-shipments";
import { driverAppUrl } from "@/lib/navigation/shipment-links";
import type { DriverTripOffer, ShipmentStatus } from "@/types/logistics";

const statusActions: { key: ShipmentStatus; label: string }[] = [
  { key: "pickup", label: "Đã tới điểm lấy" },
  { key: "loaded", label: "Đã xếp hàng" },
  { key: "in_transit", label: "Đang vận chuyển" },
  { key: "delivered", label: "Đã giao hàng" }
];

async function fetchTrips() {
  const res = await fetch("/api/driver/trips", { credentials: "include" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Lỗi");
  return json as {
    pending: DriverTripOffer[];
    active: DriverTripOffer[];
    history: DriverTripOffer[];
  };
}

export function DriverTripDetail({ code }: { code: string }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["driver-trips"], queryFn: fetchTrips });

  const trip =
    data?.active.find((t) => t.code === code) ??
    data?.pending.find((t) => t.code === code) ??
    data?.history.find((t) => t.code === code);

  const isActive = data?.active.some((t) => t.code === code);
  const autoGps = useDriverAutoGps(code, Boolean(isActive));

  const statusMut = useMutation({
    mutationFn: (status: ShipmentStatus) => api.patchShipment(code, { status }),
    onSuccess: () => invalidateShipmentFlow(qc, code)
  });

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-slate-500">
        <Loader2 className="animate-spin" size={18} /> Đang tải chuyến…
      </p>
    );
  }

  if (!trip) {
    return (
      <div className="rounded-2xl bg-amber-50 p-6 text-center">
        <p className="font-bold text-amber-900">Không thấy chuyến {code} trong app của bạn.</p>
        <Link href={driverAppUrl()} className="btn-primary mt-4 inline-flex">
          Về App tài xế
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <Link href={driverAppUrl(code, isActive ? "active" : "pending")} className="inline-flex items-center gap-2 text-sm font-bold text-orange-600">
        <ArrowLeft size={16} /> Về danh sách chuyến
      </Link>

      <section className="rounded-3xl border border-orange-200 bg-white p-5 shadow-sm">
        <p className="text-2xl font-black text-[#102033]">{trip.code}</p>
        <p className="font-semibold text-slate-600">{trip.route}</p>
        <p className="mt-2 text-sm text-slate-500">{trip.statusLabel}</p>
        {isActive && autoGps.isSending ? (
          <p className="mt-2 text-xs font-bold text-emerald-700">GPS tự động đang gửi…</p>
        ) : null}
      </section>

      <ShipmentJourneyPanel code={code} compact />

      {isActive ? (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <h3 className="font-black">Cập nhật trạng thái</h3>
            <div className="mt-3 grid gap-2">
              {statusActions.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  className="flex items-center gap-2 rounded-2xl border px-4 py-3 font-bold"
                  disabled={statusMut.isPending}
                  onClick={() => statusMut.mutate(action.key)}
                >
                  <CheckCircle2 className="text-green-600" size={18} />
                  {action.label}
                </button>
              ))}
            </div>
          </section>
          <PodUpload shipmentCode={code} />
          <div className="grid gap-2">
            <a className="btn-primary text-center" href={mapsDirectionsUrl(trip.delivery)} target="_blank" rel="noopener noreferrer">
              <Navigation size={18} className="inline" /> Chỉ đường giao
            </a>
            <Link href={`/tracking/${code}`} className="btn-secondary text-center">
              <MapPinned size={18} className="inline" /> Tracking GPS
            </Link>
          </div>
        </>
      ) : (
        <Link href={`/tracking/${code}`} className="btn-primary w-full text-center">
          Xem theo dõi
        </Link>
      )}
    </div>
  );
}
