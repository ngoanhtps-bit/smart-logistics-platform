"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ListToolbar, RowCheckbox } from "@/components/list-toolbar";
import { useBulkSelect } from "@/hooks/use-bulk-select";
import { useShipments } from "@/hooks/use-shipments";
import { matchesSearch } from "@/lib/list-search";
import { offerBadgeClass, offerStatusLabels } from "@/lib/dispatch/offer-status";
import { isUnassignedDriver } from "@/lib/dispatch/shipment-assign";
import { invalidateShipmentFlow } from "@/lib/query/invalidate-shipments";
import { journeyStatusMessage, shipmentProgressPercent } from "@/lib/shipment/workflow";
import { isDeletableShipmentStatus } from "@/lib/shipments/deletable-status";

export function CustomerOrdersList({
  selectedCode,
  onSelectCode
}: {
  selectedCode?: string;
  onSelectCode?: (code: string) => void;
}) {
  const qc = useQueryClient();
  const { data: shipments, isLoading } = useShipments({ mine: true });
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");

  const rows = useMemo(() => {
    const list = shipments ?? [];
    return list
      .filter((s) => matchesSearch(search, [s.code, s.route, s.statusLabel, s.eta]))
      .map((s) => ({ id: s.code, shipment: s }));
  }, [shipments, search]);

  const bulk = useBulkSelect(rows);

  const deleteMut = useMutation({
    mutationFn: async (codes: string[]) => {
      const res = await fetch("/api/shipments", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Xóa thất bại");
      return json;
    },
    onSuccess: (data: { message?: string }) => {
      setMsg(data.message ?? "Đã xóa đơn.");
      bulk.clear();
      invalidateShipmentFlow(qc);
    },
    onError: (e) => setMsg((e as Error).message)
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-8 text-slate-500">
        <Loader2 className="animate-spin" size={18} /> Đang tải...
      </div>
    );
  }

  return (
    <>
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Tìm mã đơn, tuyến, trạng thái…"
        total={shipments?.length ?? 0}
        filtered={rows.length}
        selectedCount={bulk.selectedCount}
        allSelected={bulk.allSelected}
        onSelectAll={bulk.selectAll}
        onClearSelection={bulk.clear}
        onDeleteSelected={() => {
          if (!bulk.selectedIds.length) return;
          if (window.confirm(`Xóa ${bulk.selectedIds.length} đơn đã chọn?`)) deleteMut.mutate(bulk.selectedIds);
        }}
        deleteLabel="Xóa đơn nháp/báo giá"
        deleting={deleteMut.isPending}
      />
      {msg ? <p className="mb-3 text-sm font-bold text-emerald-700">{msg}</p> : null}
      <div className="grid gap-3">
        {!rows.length ? (
          <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
            Chưa có đơn — dùng form «Tạo vận đơn» phía trên hoặc báo giá trang chủ.
          </p>
        ) : null}
        {rows.map(({ id, shipment: s }) => {
          const progress = shipmentProgressPercent(s);
          return (
            <div
              key={id}
              role={onSelectCode ? "button" : undefined}
              tabIndex={onSelectCode ? 0 : undefined}
              onClick={() => onSelectCode?.(s.code)}
              onKeyDown={(e) => {
                if (onSelectCode && (e.key === "Enter" || e.key === " ")) onSelectCode(s.code);
              }}
              className={`rounded-2xl border p-4 transition ${
                selectedCode === s.code
                  ? "border-emerald-400 bg-emerald-50/60 ring-2 ring-emerald-200"
                  : "border-slate-100 hover:border-emerald-200"
              } ${onSelectCode ? "cursor-pointer" : ""}`}
            >
              <div className="grid gap-2 md:grid-cols-[auto_1fr_auto] md:items-center">
                <RowCheckbox checked={bulk.isSelected(id)} onChange={() => bulk.toggle(id)} />
                <div>
                  <Link
                    href={`/tracking/${s.code}`}
                    className="font-black text-[#0b1f3a] hover:text-[#2563eb]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {s.code}
                  </Link>
                  <p className="font-semibold text-slate-600">{s.route}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{journeyStatusMessage(s)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-600">{s.statusLabel}</p>
                  <p className="font-black text-[#174ea6]">{s.eta}</p>
                  {s.offerStatus && s.offerStatus !== "none" ? (
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-black ${offerBadgeClass(s.offerStatus)}`}
                    >
                      {offerStatusLabels[s.offerStatus]}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#2563eb] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Link href={`/tracking/${s.code}`} className="font-bold text-[#2563eb]">
                  Theo dõi hành trình →
                </Link>
                {!isUnassignedDriver(s.driver) ? (
                  <span className="text-slate-500">
                    {s.driver} · {s.vehiclePlate}
                  </span>
                ) : null}
              </div>
              {!isDeletableShipmentStatus(s.status) ? (
                <p className="mt-2 text-xs text-slate-400">Đơn đang xử lý — không xóa được</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}
