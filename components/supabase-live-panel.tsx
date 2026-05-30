"use client";

import Link from "next/link";
import { Database, Radio } from "lucide-react";
import { useSupabaseShipmentsRealtime } from "@/hooks/use-supabase-shipments";
import { statusLabels } from "@/lib/status-labels";
import type { ShipmentStatus } from "@/types/logistics";

export function SupabaseLivePanel() {
  const { rows, connected, queryError, enabled } = useSupabaseShipmentsRealtime();

  if (!enabled) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 dark:border-slate-600 dark:bg-slate-900">
        <p className="text-sm font-bold text-slate-500">
          Cơ sở dữ liệu chưa cấu hình. Thêm <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> và khóa publishable vào file env.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-black text-[#102033] dark:text-white">
          <Database className="text-[#2563eb]" /> Dữ liệu trực tiếp
        </h2>
        <span
          className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${
            connected ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
          }`}
        >
          <Radio size={12} /> {connected ? "Đã kết nối" : "Đang kết nối..."}
        </span>
      </div>
      {queryError ? (
        <p className="rounded-2xl bg-orange-50 p-3 text-sm font-semibold text-orange-800">
          Lỗi đọc dữ liệu: {queryError}. Chạy <code>supabase/002_rls_policies.sql</code> trong SQL Editor.
        </p>
      ) : null}
      {rows.length === 0 && !queryError ? (
        <p className="text-sm text-slate-500">
          Chưa có dữ liệu. Chạy <code>002_rls_policies.sql</code> và bật đồng bộ thời gian thực — xem <code>SUPABASE_SETUP.md</code>.
        </p>
      ) : null}
      {rows.length > 0 ? (
        <div className="grid gap-2">
          {rows.map((row) => (
            <Link
              key={row.code}
              href={`/tracking/${row.code}`}
              className="rounded-2xl bg-[#f8fafc] p-3 text-sm transition hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              <span className="font-black text-[#102033] dark:text-white">{row.code}</span>
              <span className="mx-2 text-slate-400">·</span>
              <span className="font-semibold text-[#2563eb]">
                {statusLabels[row.status as ShipmentStatus] ?? row.status}
              </span>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                {row.pickup_location} → {row.delivery_location}
              </p>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
