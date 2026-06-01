"use client";

import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { eventTypeLabels } from "@/lib/operations/shipment-events";
import { useShipmentJourney } from "@/hooks/use-shipment-journey";
import { offerBadgeClass, offerStatusLabels } from "@/lib/dispatch/offer-status";

export function ShipmentJourneyPanel({
  code,
  compact = false
}: {
  code: string;
  compact?: boolean;
}) {
  const { data, isLoading, error } = useShipmentJourney(code);

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="animate-spin" size={16} /> Đang tải hành trình đơn…
      </p>
    );
  }

  if (error || !data) {
    return (
      <p className="rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-800">
        {(error as Error)?.message ?? "Chưa có dữ liệu hành trình"}
      </p>
    );
  }

  const { steps, nextActions, statusMessage, progressPercent, shipment, events } = data;

  return (
    <div className={`grid gap-4 ${compact ? "" : "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"}`}>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-black text-[#102033]">{statusMessage}</p>
          {shipment.offerStatus && shipment.offerStatus !== "none" ? (
            <span
              className={`rounded-full px-2 py-1 text-xs font-black ${offerBadgeClass(shipment.offerStatus)}`}
            >
              {offerStatusLabels[shipment.offerStatus]}
            </span>
          ) : null}
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#2563eb] to-emerald-500 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-1 text-xs font-bold text-slate-500">Tiến độ {progressPercent}%</p>
      </div>

      <ol className="grid gap-0 sm:grid-cols-6">
        {steps.map((step, i) => (
          <li key={step.id} className="relative flex flex-col items-center text-center">
            {i < steps.length - 1 ? (
              <span
                className={`absolute left-[calc(50%+14px)] top-4 hidden h-0.5 w-[calc(100%-28px)] sm:block ${
                  step.done ? "bg-emerald-400" : "bg-slate-200"
                }`}
              />
            ) : null}
            <span
              className={`relative z-10 grid size-8 place-items-center rounded-full text-xs font-black ${
                step.current
                  ? "bg-[#2563eb] text-white ring-4 ring-blue-100"
                  : step.done
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {step.done ? "✓" : i + 1}
            </span>
            <p className={`mt-2 text-[10px] font-black leading-tight sm:text-xs ${step.current ? "text-[#2563eb]" : "text-slate-600"}`}>
              {step.label}
            </p>
            {step.detail && !compact ? (
              <p className="mt-0.5 line-clamp-2 text-[10px] font-semibold text-slate-500">{step.detail}</p>
            ) : null}
          </li>
        ))}
      </ol>

      {nextActions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {nextActions.map((a) => (
            <Link
              key={a.href + a.label}
              href={a.href}
              className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-black ${
                a.primary ? "bg-[#102033] text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {a.label}
              <ArrowRight size={12} />
            </Link>
          ))}
        </div>
      ) : null}

      {!compact && events.length > 0 ? (
        <div className="border-t border-slate-100 pt-3">
          <p className="text-xs font-black uppercase text-slate-400">Nhật ký liên kết</p>
          <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto">
            {events.slice(0, 6).map((ev) => (
              <li key={ev.id} className="text-xs text-slate-600">
                <span className="font-bold text-[#2563eb]">{eventTypeLabels[ev.eventType]}</span>
                {" — "}
                {ev.message}
                <span className="text-slate-400"> · {new Date(ev.createdAt).toLocaleString("vi-VN")}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
