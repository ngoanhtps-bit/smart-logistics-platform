"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { UserRole } from "@/types/logistics";

const steps = [
  { id: "customer", label: "Khách đặt", href: "/customer?tab=create" },
  { id: "dispatcher", label: "Điều phối gán", href: "/dispatcher?tab=assign" },
  { id: "driver", label: "Tài xế chốt", href: "/driver?tab=pending" },
  { id: "tracking", label: "Theo dõi GPS", href: null as string | null }
];

export function ShipmentFlowStrip({
  role,
  trackingCode
}: {
  role?: UserRole | null;
  trackingCode?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-black uppercase tracking-wider text-slate-400">Luồng liên kết đơn</p>
      <ol className="mt-3 flex flex-wrap items-center gap-2">
        {steps.map((step, i) => {
          const isYou = role === step.id || (role === "admin" && step.id === "dispatcher");
          const href =
            step.id === "tracking" && trackingCode
              ? `/tracking/${trackingCode}`
              : step.href;
          return (
            <li key={step.id} className="flex items-center gap-2">
              {i > 0 ? <ArrowRight size={14} className="text-slate-300" /> : null}
              {href ? (
                <Link
                  href={href}
                  className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                    isYou
                      ? "bg-[#102033] text-white ring-2 ring-orange-300"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {step.label}
                  {isYou ? " · Bạn" : ""}
                </Link>
              ) : (
                <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-400">
                  {step.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {trackingCode ? (
        <p className="mt-2 text-xs font-semibold text-slate-500">
          Mã đơn <strong className="text-[#2563eb]">{trackingCode}</strong> — cùng dữ liệu trên mọi màn
        </p>
      ) : null}
    </div>
  );
}
