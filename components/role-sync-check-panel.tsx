"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ExternalLink, Loader2, XCircle } from "lucide-react";
import { eventTypeLabels } from "@/lib/operations/shipment-events";

type VerifyPayload = {
  timestamp: string;
  shipmentCount: number;
  activeCount: number;
  pendingOfferCount: number;
  latestShipment: {
    code: string;
    status: string;
    statusLabel: string;
    offerStatus: string;
    driver: string;
    vehiclePlate: string;
    journeyMessage: string;
  } | null;
  recentEvents: { id: string; shipmentCode: string; eventType: string; message: string; createdAt: string }[];
  checks: { id: string; ok: boolean; label: string }[];
};

const testSteps = [
  { role: "Khách", href: "/customer", action: "Tạo đơn mới → chuyển Tracking" },
  { role: "Điều phối", href: "/dispatcher", action: "Tab Gán xe / Điều khiển → gửi chốt app" },
  { role: "Tài xế", href: "/driver", action: "Chốt chuyến → cập nhật trạng thái" },
  { role: "Admin", href: "/admin", action: "Tab «Vận hành» → kiểm tra đồng bộ + nhật ký" }
];

export function RoleSyncCheckPanel() {
  const { data, isLoading, error, dataUpdatedAt } = useQuery({
    queryKey: ["sync-verify"],
    queryFn: async () => {
      const res = await fetch("/api/sync/verify", { credentials: "include", cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Không kiểm tra được");
      return json as VerifyPayload;
    },
    refetchInterval: 10_000
  });

  const ago = dataUpdatedAt ? Math.max(1, Math.round((Date.now() - dataUpdatedAt) / 1000)) : null;

  return (
    <section className="rounded-3xl border-2 border-dashed border-[#2563eb]/40 bg-white p-6">
      <h2 className="text-xl font-black text-[#102033]">Kiểm tra đồng bộ 4 vai trò</h2>
      <p className="mt-1 text-sm text-slate-600">
        Dùng cùng một mã đơn (SPL) trên tất cả màn hình — số liệu và nhật ký phải khớp.
        {ago ? ` Cập nhật ${ago}s trước.` : null}
      </p>

      {isLoading ? (
        <p className="mt-4 flex items-center gap-2 text-slate-500">
          <Loader2 className="animate-spin" size={18} /> Đang quét hệ thống…
        </p>
      ) : error ? (
        <p className="mt-4 text-sm font-bold text-red-600">{(error as Error).message}</p>
      ) : (
        <>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {data?.checks.map((c) => (
              <div
                key={c.id}
                className={`flex items-center gap-2 rounded-xl p-3 text-sm font-bold ${
                  c.ok ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"
                }`}
              >
                {c.ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                {c.label}
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-[#f8fafc] p-4">
              <p className="text-xs font-black uppercase text-slate-500">Đơn mới nhất (mọi vai trò thấy cùng)</p>
              {data?.latestShipment ? (
                <>
                  <p className="mt-2 text-2xl font-black">{data.latestShipment.code}</p>
                  <p className="text-sm font-semibold text-slate-600">{data.latestShipment.journeyMessage}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {data.latestShipment.statusLabel} · {data.latestShipment.driver} · {data.latestShipment.vehiclePlate}
                    {data.latestShipment.offerStatus !== "none"
                      ? ` · Chốt app: ${data.latestShipment.offerStatus}`
                      : ""}
                  </p>
                  <Link
                    href={`/tracking/${data.latestShipment.code}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#2563eb]"
                  >
                    Mở Tracking <ExternalLink size={14} />
                  </Link>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-500">Chưa có đơn — tạo từ Khách hàng.</p>
              )}
              <p className="mt-3 text-xs font-bold text-slate-500">
                Tổng {data?.shipmentCount} đơn · {data?.activeCount} đang chạy · {data?.pendingOfferCount} chờ tài xế chốt
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8fafc] p-4">
              <p className="text-xs font-black uppercase text-slate-500">Nhật ký gần nhất</p>
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs">
                {(data?.recentEvents ?? []).length === 0 ? (
                  <li className="text-slate-400">Chưa có — chạy SQL 020</li>
                ) : (
                  data?.recentEvents.map((ev) => (
                    <li key={ev.id}>
                      <span className="font-bold text-[#102033]">{ev.shipmentCode}</span>
                      {" · "}
                      <span className="text-[#2563eb]">{eventTypeLabels[ev.eventType as keyof typeof eventTypeLabels]}</span>
                      {" — "}
                      {ev.message}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </>
      )}

      <div className="mt-6">
        <p className="text-sm font-black text-[#102033]">Quy trình test nhanh</p>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
          {testSteps.map((step, i) => (
            <li key={step.role} className="rounded-xl border border-slate-100 bg-white p-3">
              <span className="text-xs font-black text-orange-600">Bước {i + 1}</span>
              <p className="font-black text-[#102033]">{step.role}</p>
              <p className="text-xs text-slate-600">{step.action}</p>
              <Link href={step.href} className="mt-2 inline-block text-xs font-bold text-[#2563eb]" target="_blank">
                Mở màn hình ↗
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
