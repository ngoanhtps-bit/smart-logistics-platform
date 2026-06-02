"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Package } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { invalidateShipmentFlow } from "@/lib/query/invalidate-shipments";

export function CustomerNewOrder({ onCreated }: { onCreated?: (code: string) => void }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    pickup: "",
    delivery: "",
    cargoType: "",
    weight: "",
    vehicleType: "Container 40FT",
    shipDate: new Date().toISOString().slice(0, 10)
  });

  const mut = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/shipments", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Tạo đơn thất bại");
      return data as { code: string };
    },
    onSuccess: (data) => {
      invalidateShipmentFlow(qc, data.code);
      if (onCreated) onCreated(data.code);
      else router.push(`/tracking/${data.code}`);
    }
  });

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6">
      <h2 className="flex items-center gap-2 text-xl font-black text-[#102033]">
        <Package className="text-[#2563eb]" size={22} /> Tạo vận đơn mới
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
          placeholder="Điểm lấy hàng"
          value={form.pickup}
          onChange={(e) => setForm({ ...form, pickup: e.target.value })}
        />
        <input
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
          placeholder="Điểm giao"
          value={form.delivery}
          onChange={(e) => setForm({ ...form, delivery: e.target.value })}
        />
        <input
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
          placeholder="Loại hàng"
          value={form.cargoType}
          onChange={(e) => setForm({ ...form, cargoType: e.target.value })}
        />
        <input
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
          placeholder="Trọng lượng"
          value={form.weight}
          onChange={(e) => setForm({ ...form, weight: e.target.value })}
        />
        <input
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold sm:col-span-2"
          placeholder="Loại xe"
          value={form.vehicleType}
          onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
        />
      </div>
      <button
        className="btn-primary mt-4 w-full sm:w-auto"
        type="button"
        disabled={mut.isPending || !form.pickup || !form.delivery}
        onClick={() => mut.mutate()}
      >
        {mut.isPending ? <Loader2 className="animate-spin" size={18} /> : "Gửi yêu cầu vận chuyển"}
      </button>
      {mut.isError ? <p className="mt-2 text-sm font-bold text-red-600">{(mut.error as Error).message}</p> : null}
    </section>
  );
}
