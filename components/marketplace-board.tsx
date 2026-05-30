"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Boxes, Gavel, Loader2, Truck } from "lucide-react";
import { useState } from "react";
import { labelMarketplaceStatus } from "@/lib/vi-labels";

type Load = {
  id: string;
  code: string;
  route: string;
  cargo: string;
  weight: string;
  price: string;
  match: string;
  vehicle: string;
  status: string;
  bids: { carrier: string; amount: string; eta: string }[];
};

async function fetchLoads() {
  const res = await fetch("/api/marketplace");
  return res.json() as Promise<Load[]>;
}

export function MarketplaceBoard() {
  const qc = useQueryClient();
  const { data: loads, isLoading } = useQuery({ queryKey: ["marketplace"], queryFn: fetchLoads });
  const [bidForm, setBidForm] = useState({ loadId: "", amount: "", eta: "3 ngày" });

  const bidMut = useMutation({
    mutationFn: () =>
      fetch("/api/marketplace", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bid",
          loadId: bidForm.loadId,
          amount: bidForm.amount,
          eta: bidForm.eta,
          carrier: "Đối tác Logistics Thông minh"
        })
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["marketplace"] })
  });

  const acceptMut = useMutation({
    mutationFn: (loadId: string) =>
      fetch("/api/marketplace", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept", loadId, bidIndex: 0 })
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["marketplace"] })
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-12 text-slate-500">
        <Loader2 className="animate-spin" /> Đang tải sàn ghép chuyến...
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="flex items-center gap-2 text-xl font-black text-[#102033] dark:text-white">
          <Gavel className="text-orange-600" /> Đặt giá thầu nhanh
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            value={bidForm.loadId}
            onChange={(e) => setBidForm({ ...bidForm, loadId: e.target.value })}
          >
            <option value="">Chọn đơn hàng</option>
            {loads?.map((l) => (
              <option key={l.id} value={l.id}>
                {l.code}
              </option>
            ))}
          </select>
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            placeholder="Giá đề xuất"
            value={bidForm.amount}
            onChange={(e) => setBidForm({ ...bidForm, amount: e.target.value })}
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            placeholder="Thời gian giao (ETA)"
            value={bidForm.eta}
            onChange={(e) => setBidForm({ ...bidForm, eta: e.target.value })}
          />
          <button className="btn-primary" type="button" disabled={!bidForm.loadId || bidMut.isPending} onClick={() => bidMut.mutate()}>
            Gửi giá thầu
          </button>
        </div>
      </section>

      <div className="grid gap-4">
        {loads?.map((load) => (
          <article key={load.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase text-slate-500">
                  {load.code} · {labelMarketplaceStatus(load.status)}
                </p>
                <h3 className="mt-1 text-2xl font-black text-[#102033] dark:text-white">{load.route}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {load.cargo} · {load.weight} · {load.vehicle}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-3 dark:bg-orange-950">
                <Boxes className="text-orange-600" />
                <span className="font-black">{load.price}</span>
                <span className="text-sm font-bold text-green-700">{load.match}</span>
              </div>
            </div>
            {load.bids.length > 0 ? (
              <div className="mt-4 grid gap-2">
                {load.bids.map((b, i) => (
                  <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{b.carrier}</span>
                    <span className="text-sm">{b.amount} · {b.eta}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Chưa có giá thầu</p>
            )}
            <button
              className="btn-secondary mt-4"
              type="button"
              disabled={load.status === "assigned" || acceptMut.isPending}
              onClick={() => acceptMut.mutate(load.id)}
            >
              <Truck size={17} /> Chấp nhận giá thầu & gán chuyến
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
