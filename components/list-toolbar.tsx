"use client";

import { Search, Trash2 } from "lucide-react";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  total: number;
  filtered: number;
  selectedCount: number;
  allSelected: boolean;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDeleteSelected?: () => void;
  deleteLabel?: string;
  deleting?: boolean;
  extra?: React.ReactNode;
};

export function ListToolbar({
  search,
  onSearchChange,
  placeholder = "Tìm nhanh theo tên, mã, email…",
  total,
  filtered,
  selectedCount,
  allSelected,
  onSelectAll,
  onClearSelection,
  onDeleteSelected,
  deleteLabel = "Xóa đã chọn",
  deleting,
  extra
}: Props) {
  return (
    <div className="mb-4 grid gap-3 rounded-2xl border border-slate-100 bg-[#f8fafc] p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="search"
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm font-semibold"
            placeholder={placeholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {extra}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="font-bold text-slate-500">
          Hiển thị <span className="text-[#102033]">{filtered}</span> / {total}
          {selectedCount > 0 ? (
            <span className="ml-2 text-[#2563eb]">· Đã chọn {selectedCount}</span>
          ) : null}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 font-bold text-slate-600">
            <input
              type="checkbox"
              className="size-4 rounded border-slate-300"
              checked={allSelected && filtered > 0}
              onChange={() => (allSelected ? onClearSelection() : onSelectAll())}
            />
            Chọn tất cả
          </label>
          {selectedCount > 0 && onDeleteSelected ? (
            <button
              type="button"
              className="flex items-center gap-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
              disabled={deleting}
              onClick={onDeleteSelected}
            >
              <Trash2 size={14} />
              {deleting ? "Đang xóa…" : deleteLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function RowCheckbox({
  checked,
  onChange
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <input
      type="checkbox"
      className="mt-1 size-4 shrink-0 rounded border-slate-300"
      checked={checked}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
    />
  );
}
