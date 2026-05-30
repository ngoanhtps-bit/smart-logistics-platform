"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Receipt } from "lucide-react";

type Invoice = {
  id: string;
  code: string;
  shipmentCode: string;
  amount: string;
  status: string;
  statusLabel: string;
};

export function DispatcherInvoices() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["invoices", "all"],
    queryFn: () => fetch("/api/invoices", { credentials: "include" }).then((r) => r.json() as Promise<Invoice[]>)
  });

  const markPaid = useMutation({
    mutationFn: (id: string) =>
      fetch("/api/invoices", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] })
  });

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-xl font-black text-[#102033]">
        <Receipt className="text-orange-600" size={22} /> Hóa đơn vận chuyển
      </h2>
      <p className="mt-1 text-sm text-slate-500">Tự tạo khi chuyến chuyển trạng thái «Đã giao».</p>

      {isLoading ? (
        <p className="mt-4 flex items-center gap-2 text-slate-500">
          <Loader2 className="animate-spin" size={18} /> Đang tải...
        </p>
      ) : (
        <div className="mt-4 grid gap-3">
          {(data ?? []).map((inv) => (
            <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#f8fafc] p-4">
              <div>
                <p className="font-black">{inv.code}</p>
                <p className="text-sm text-slate-600">
                  {inv.shipmentCode} · {inv.amount}
                </p>
                <p className="text-xs font-bold text-slate-500">{inv.statusLabel}</p>
              </div>
              {inv.status === "pending" ? (
                <button
                  className="btn-secondary text-sm"
                  type="button"
                  disabled={markPaid.isPending}
                  onClick={() => markPaid.mutate(inv.id)}
                >
                  Xác nhận đã thu
                </button>
              ) : null}
            </div>
          ))}
          {!data?.length ? <p className="text-sm text-slate-500">Chưa có hóa đơn.</p> : null}
        </div>
      )}
    </section>
  );
}
