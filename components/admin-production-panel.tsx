"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";

export function AdminProductionPanel() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["production-readiness"],
    queryFn: () => fetch("/api/setup/readiness").then((r) => r.json())
  });

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-slate-500">
        <Loader2 className="animate-spin" size={18} /> Đang kiểm tra...
      </p>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-[#102033]">Sẵn sàng vận hành</h2>
          <p className="mt-1 text-sm text-slate-500">
            {data?.ready ? "Hệ thống đạt điều kiện tối thiểu." : "Cần bổ sung cấu hình trước khi go-live."}
          </p>
        </div>
        <button className="btn-ghost text-sm" type="button" onClick={() => refetch()} disabled={isFetching}>
          Kiểm tra lại
        </button>
      </div>

      <div className="mt-6 grid gap-2">
        {(data?.checks ?? []).map((c: { id: string; label: string; ok: boolean; detail: string }) => (
          <div
            key={c.id}
            className={`flex items-start gap-3 rounded-2xl p-3 ${c.ok ? "bg-emerald-50" : "bg-amber-50"}`}
          >
            {c.ok ? (
              <CheckCircle2 className="shrink-0 text-emerald-600" size={20} />
            ) : (
              <XCircle className="shrink-0 text-amber-700" size={20} />
            )}
            <div>
              <p className="font-bold text-[#102033]">{c.label}</p>
              <p className="text-sm text-slate-600">{c.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-[#f8fafc] p-4 text-sm">
        <p>
          <strong>Site:</strong> {data?.siteUrl}
        </p>
        <p className="mt-1">
          <strong>Auth callback:</strong> {data?.authCallbackUrl}
        </p>
        <p className="mt-1">
          <strong>DB:</strong>{" "}
          {data?.database?.connected
            ? `${data.database.shipmentCount} vận đơn`
            : data?.database?.error ?? "Chưa kết nối"}
        </p>
      </div>

      <ul className="mt-4 grid gap-2 text-sm font-semibold text-slate-600">
        <li>
          <Link className="text-[#2563eb] hover:underline" href="/api/health" target="_blank">
            /api/health
          </Link>
        </li>
        <li>
          <Link className="text-[#2563eb] hover:underline" href="/api/setup/readiness" target="_blank">
            /api/setup/readiness
          </Link>
        </li>
        <li>Hướng dẫn: LAUNCH.md · SUPABASE_SETUP.md</li>
      </ul>
    </section>
  );
}
