"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Receipt } from "lucide-react";

type Invoice = {
  id: string;
  code: string;
  shipmentCode: string;
  amount: string;
  status: string;
  statusLabel: string;
};

export function CustomerInvoices() {
  const { data, isLoading } = useQuery({
    queryKey: ["invoices", "mine"],
    queryFn: () => fetch("/api/invoices?scope=mine", { credentials: "include" }).then((r) => r.json() as Promise<Invoice[]>)
  });

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6">
      <h2 className="flex items-center gap-2 text-lg font-black text-[#102033]">
        <Receipt size={20} className="text-orange-600" /> Hóa đơn
      </h2>
      {isLoading ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="animate-spin" size={16} /> Đang tải...
        </p>
      ) : !data?.length ? (
        <p className="mt-4 text-sm text-slate-500">Chưa có hóa đơn — phát sinh khi chuyến giao thành công.</p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {data.map((inv) => (
            <li key={inv.id} className="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-black text-[#102033]">{inv.code}</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    inv.status === "paid" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-800"
                  }`}
                >
                  {inv.statusLabel}
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-600">{inv.amount}</p>
              <Link className="mt-2 inline-block text-sm font-bold text-[#2563eb] hover:underline" href={`/tracking/${inv.shipmentCode}`}>
                {inv.shipmentCode} →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
