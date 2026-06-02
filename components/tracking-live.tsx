"use client";

import { CheckCircle2, Clock3, Loader2, Truck } from "lucide-react";
import { LogisticsMap } from "@/components/logistics-map";
import { PodUpload } from "@/components/pod-upload";
import { ShipmentJourneyPanel } from "@/components/shipment-journey-panel";
import { TrackingRolePanel } from "@/components/tracking-role-panel";
import { useLogisticsRealtimeSync } from "@/hooks/use-logistics-realtime-sync";
import { useSocketTracking } from "@/hooks/use-socket-tracking";
import { useTrackingStream } from "@/hooks/use-tracking-stream";
import { useTracking } from "@/hooks/use-shipments";

export function TrackingLive({ code }: { code: string }) {
  useLogisticsRealtimeSync(true);
  const { data, isLoading, isError, dataUpdatedAt } = useTracking(code, 12_000);
  const { data: stream, connected } = useTrackingStream(code, !isLoading && !isError);
  const { data: socketData, connected: socketConnected, enabled: socketEnabled } = useSocketTracking(
    code,
    !isLoading && !isError
  );

  if (isLoading) {
    return (
      <div className="container flex min-h-[320px] items-center justify-center gap-3 py-20">
        <Loader2 className="animate-spin text-[#2563eb]" />
        <span className="font-bold text-slate-600">Đang tải theo dõi...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container py-20 text-center">
        <p className="font-bold text-red-600">Không tìm thấy vận đơn {code}</p>
      </div>
    );
  }

  const { shipment, timeline } = data;
  const updatedSec = Math.max(1, Math.round((Date.now() - dataUpdatedAt) / 1000));
  const speed = socketData?.speed ?? stream?.current.speed ?? data.current.speed;

  return (
    <section className="section bg-white">
      <div className="container mb-8">
        <TrackingRolePanel code={code} offerStatus={shipment.offerStatus} />
        <ShipmentJourneyPanel code={code} />
      </div>
      <div className="container grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <LogisticsMap shipmentCode={shipment.code} speed={speed} updatedSec={updatedSec} />
          <p className="mt-2 text-center text-xs font-bold text-slate-500">
            {socketEnabled
              ? socketConnected
                ? "● Đã kết nối Socket"
                : "○ Đang kết nối Socket..."
              : connected
                ? "● Cập nhật thời gian thực (SSE)"
                : "○ Đang kết nối SSE..."}
            {(socketData?.progress ?? stream?.progress) != null
              ? ` · Tiến độ ${Math.round((socketData?.progress ?? stream?.progress ?? 0) * 100)}%`
              : ""}
          </p>
        </div>
        <div className="grid gap-4">
          <div className="rounded-3xl border border-slate-200 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-500">Tài xế</p>
                <h2 className="text-2xl font-black text-[#0b1f3a]">{shipment.driver}</h2>
                <p className="text-sm text-slate-500">{shipment.driverPhone}</p>
              </div>
              <span className="rounded-full bg-green-50 px-3 py-2 text-sm font-black text-green-700">
                {shipment.statusLabel}
              </span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#f8fafc] p-4">
                <Clock3 className="text-orange-600" />
                <p className="mt-3 text-sm font-bold text-slate-500">ETA</p>
                <p className="font-black text-[#0b1f3a]">{shipment.eta}</p>
              </div>
              <div className="rounded-2xl bg-[#f8fafc] p-4">
                <Truck className="text-[#174ea6]" />
                <p className="mt-3 text-sm font-bold text-slate-500">Phương tiện</p>
                <p className="font-black text-[#102033]">
                  {shipment.vehiclePlate} / {shipment.vehicleType}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 p-6">
            <h2 className="text-xl font-black text-[#102033]">Timeline</h2>
            <div className="mt-5 grid gap-4">
              {timeline.map((item) => (
                <div key={item.step} className="flex items-center gap-3">
                  <span
                    className={`grid size-9 place-items-center rounded-full ${
                      item.done ? "bg-green-600 text-white" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <CheckCircle2 size={18} />
                  </span>
                  <span className={`font-bold ${item.done ? "text-slate-800" : "text-slate-400"}`}>{item.step}</span>
                </div>
              ))}
            </div>
          </div>

              <PodUpload shipmentCode={shipment.code} />
        </div>
      </div>
    </section>
  );
}
