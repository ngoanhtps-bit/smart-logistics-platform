"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ListToolbar, RowCheckbox } from "@/components/list-toolbar";
import { useBulkSelect } from "@/hooks/use-bulk-select";
import { useShipments } from "@/hooks/use-shipments";
import { matchesSearch } from "@/lib/list-search";
import { isDeletableShipmentStatus } from "@/lib/shipments/deletable-status";
import { statusLabels } from "@/lib/status-labels";
import type { Shipment } from "@/types/logistics";

type Row = { id: string; shipment: Shipment };

export function DispatchOrdersManager() {
  const qc = useQueryClient();
  const { data: shipments, isLoading, isError } = useShipments();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"deletable" | "all">("deletable");
  const [msg, setMsg] = useState("");

  const rows: Row[] = useMemo(() => {
    const list = shipments ?? [];
    const filtered =
      statusFilter === "deletable"
        ? list.filter((s) => isDeletableShipmentStatus(s.status))
        : list;
    return filtered
      .filter((s) =>
        matchesSearch(search, [
          s.code,
          s.route,
          s.pickup,
          s.delivery,
          s.driver,
          s.vehiclePlate,
          s.statusLabel,
          statusLabels[s.status]
        ])
      )
      .map((s) => ({ id: s.code, shipment: s }));
  }, [shipments, search, statusFilter]);

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
      return json as { message: string; deleted: number };
    },
    onSuccess: (data) => {
      setMsg(data.message);
      bulk.clear();
      qc.invalidateQueries({ queryKey: ["shipments"] });
    },
    onError: (e) => setMsg((e as Error).message)
  });

  function confirmBulkDelete() {
    const codes = bulk.selectedIds;
    if (!codes.length) return;
    const n = codes.length;
    if (!window.confirm(`Xóa ${n} đơn đã chọn? Chỉ áp dụng đơn nháp / báo giá / hủy.`)) return;
    deleteMut.mutate(codes);
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-black uppercase tracking-[0.12em] text-red-600">Quản lý đơn</p>
        <h2 className="mt-1 text-2xl font-black text-[#102033]">Đơn lỗi / chưa chốt</h2>
        <p className="mt-1 text-sm text-slate-500">
          Chọn tích và xóa nhanh đơn <strong>nháp</strong>, <strong>báo giá</strong> hoặc <strong>đã hủy</strong>. Đơn đang chạy không xóa được.
        </p>
      </div>

      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Tìm mã SPL, tuyến, tài xế, biển số…"
        total={shipments?.length ?? 0}
        filtered={rows.length}
        selectedCount={bulk.selectedCount}
        allSelected={bulk.allSelected}
        onSelectAll={bulk.selectAll}
        onClearSelection={bulk.clear}
        onDeleteSelected={confirmBulkDelete}
        deleteLabel="Xóa đơn đã chọn"
        deleting={deleteMut.isPending}
        extra={
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "deletable" | "all")}
          >
            <option value="deletable">Chỉ đơn có thể xóa</option>
            <option value="all">Tất cả trạng thái</option>
          </select>
        }
      />

      {msg ? <p className="mb-3 text-sm font-bold text-emerald-700">{msg}</p> : null}

      {isLoading ? (
        <p className="flex items-center gap-2 text-slate-500">
          <Loader2 className="animate-spin" size={18} /> Đang tải đơn...
        </p>
      ) : isError ? (
        <p className="text-sm font-bold text-red-600">Không tải được danh sách đơn.</p>
      ) : rows.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
          Không có đơn phù hợp bộ lọc.
        </p>
      ) : (
        <div className="grid gap-2">
          {rows.map(({ id, shipment: s }) => (
            <div
              key={id}
              className="flex gap-3 rounded-2xl border border-slate-100 bg-[#f8fafc] p-4"
            >
              <RowCheckbox checked={bulk.isSelected(id)} onChange={() => bulk.toggle(id)} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link href={`/tracking/${s.code}`} className="font-black text-[#102033] hover:text-[#2563eb]">
                    {s.code}
                  </Link>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      isDeletableShipmentStatus(s.status)
                        ? "bg-amber-50 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {s.statusLabel}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-600">{s.route}</p>
                <p className="text-xs text-slate-500">
                  {s.driver} · {s.vehiclePlate}
                  {!isDeletableShipmentStatus(s.status) ? " · Không thể xóa" : null}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
