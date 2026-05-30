"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ListToolbar } from "@/components/list-toolbar";
import { useShipments } from "@/hooks/use-shipments";
import { matchesSearch } from "@/lib/list-search";

export function DispatchActiveShipments() {
  const { data: shipments, isLoading, isError } = useShipments();
  const [search, setSearch] = useState("");
  const active = useMemo(
    () =>
      (shipments ?? [])
        .filter((s) => s.status !== "delivered" && s.status !== "cancelled")
        .filter((s) =>
          matchesSearch(search, [s.code, s.route, s.driver, s.vehiclePlate, s.statusLabel])
        ),
    [shipments, search]
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-8 text-slate-500">
        <Loader2 className="animate-spin" size={18} /> Đang tải vận đơn...
      </div>
    );
  }

  if (isError || active.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        {isError
          ? "Không tải được đơn — kiểm tra kết nối cơ sở dữ liệu (file 002_rls_policies.sql)."
          : "Chưa có vận đơn đang chạy. Tạo đơn ở form phía trên."}
      </p>
    );
  }

  return (
    <div className="mt-5">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Tìm vận đơn đang chạy…"
        total={shipments?.filter((s) => s.status !== "delivered" && s.status !== "cancelled").length ?? 0}
        filtered={active.length}
        selectedCount={0}
        allSelected={false}
        onSelectAll={() => {}}
        onClearSelection={() => {}}
      />
      <div className="grid gap-3">
      {active.map((shipment) => (
        <Link
          key={shipment.code}
          href={`/tracking/${shipment.code}`}
          className="block rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-black text-[#102033]">{shipment.code}</p>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-[#2563eb]">
              {shipment.statusLabel}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-600">{shipment.route}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">
            {shipment.driver} · {shipment.vehiclePlate}
          </p>
          <p className="mt-2 text-xs font-bold uppercase text-slate-500">ETA {shipment.eta}</p>
        </Link>
      ))}
      </div>
    </div>
  );
}
