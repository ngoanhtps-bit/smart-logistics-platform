"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { ListToolbar, RowCheckbox } from "@/components/list-toolbar";
import { useBulkSelect } from "@/hooks/use-bulk-select";
import { matchesSearch } from "@/lib/list-search";
import { slugify } from "@/lib/cms/slug";

type Vehicle = {
  id: string;
  slug: string;
  title: string;
  image: string;
  capacity: string;
  cargo: string;
  size: string;
  published: boolean;
  sortOrder: number;
};

const empty = {
  title: "",
  slug: "",
  image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=900&q=80",
  capacity: "",
  cargo: "",
  size: "",
  published: true,
  sortOrder: 99
};

export function AdminVehiclesTab({ globalSearch = "" }: { globalSearch?: string }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-vehicles"],
    queryFn: async () => {
      const res = await fetch("/api/admin/vehicle-categories", { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Lỗi tải loại xe");
      return json as Vehicle[];
    }
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/vehicle-categories", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          slug: form.slug.trim() || slugify(form.title)
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Lưu thất bại");
      return json as Vehicle;
    },
    onSuccess: (v) => {
      setMsg(`Đã lưu «${v.title}» — hiển thị trang chủ & /${v.slug}`);
      setForm(empty);
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
      qc.invalidateQueries({ queryKey: ["vehicle-categories"] });
    },
    onError: (e) => setMsg((e as Error).message)
  });

  const toggleMut = useMutation({
    mutationFn: async (v: Vehicle) => {
      const res = await fetch("/api/admin/vehicle-categories", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...v, published: !v.published })
      });
      if (!res.ok) throw new Error("Cập nhật thất bại");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
      qc.invalidateQueries({ queryKey: ["vehicle-categories"] });
    }
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/vehicle-categories?id=${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Xóa thất bại");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
      qc.invalidateQueries({ queryKey: ["vehicle-categories"] });
    }
  });

  const combinedSearch = [globalSearch, search].filter(Boolean).join(" ");
  const filtered = useMemo(
    () =>
      (data ?? []).filter((v) =>
        matchesSearch(combinedSearch, [v.title, v.slug, v.capacity, v.cargo, v.size])
      ),
    [data, combinedSearch]
  );
  const bulk = useBulkSelect(filtered);

  const bulkDelMut = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        const res = await fetch(`/api/admin/vehicle-categories?id=${id}`, {
          method: "DELETE",
          credentials: "include"
        });
        if (!res.ok) throw new Error("Xóa thất bại");
      }
    },
    onSuccess: () => {
      bulk.clear();
      setMsg("Đã xóa loại xe đã chọn.");
      qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
      qc.invalidateQueries({ queryKey: ["vehicle-categories"] });
    }
  });

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Quản lý loại xe</h2>
          <p className="mt-1 text-sm text-slate-500">
            Thêm/sửa loại xe — <strong>xuất bản</strong> sẽ hiển thị ngay trên{" "}
            <Link href="/" className="font-bold text-[#2563eb]">
              trang chủ
            </Link>{" "}
            và trang <code>/slug</code>. Chạy SQL <code>018_vehicle_categories_cms.sql</code> lần đầu.
          </p>
        </div>
        <button className="btn-primary text-sm md:w-auto" type="button" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> {showForm ? "Đóng" : "Thêm loại xe"}
        </button>
      </div>

      {error ? (
        <p className="rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-800">
          {(error as Error).message}. Chạy <code>supabase/018_vehicle_categories_cms.sql</code> trên Supabase.
        </p>
      ) : null}

      {showForm ? (
        <div className="mb-6 grid gap-3 rounded-2xl border border-blue-100 bg-[#f8fbff] p-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-xs font-bold uppercase text-slate-500">Tên loại xe *</span>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm font-semibold"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Xe tải 10T"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase text-slate-500">Slug URL</span>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm font-semibold"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder={form.title ? slugify(form.title) : "xe-tai-10-tan"}
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase text-slate-500">Thứ tự hiển thị</span>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm font-semibold"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs font-bold uppercase text-slate-500">Ảnh (URL) *</span>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm font-semibold"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase text-slate-500">Tải trọng *</span>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm font-semibold"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              placeholder="10 tấn"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase text-slate-500">Kích thước *</span>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm font-semibold"
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              placeholder="Thùng dài 7.5m"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs font-bold uppercase text-slate-500">Hàng phù hợp *</span>
            <textarea
              className="mt-1 min-h-[60px] w-full rounded-xl border px-3 py-2 text-sm font-semibold"
              value={form.cargo}
              onChange={(e) => setForm({ ...form, cargo: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-bold md:col-span-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Xuất bản — hiển thị trang chủ
          </label>
          <button
            className="btn-primary md:col-span-2"
            type="button"
            disabled={saveMut.isPending || !form.title || !form.capacity || !form.cargo || !form.size}
            onClick={() => saveMut.mutate()}
          >
            {saveMut.isPending ? <Loader2 className="animate-spin" size={18} /> : "Lưu & hiển thị trang chủ"}
          </button>
        </div>
      ) : null}

      {msg ? <p className="mb-4 text-sm font-bold text-emerald-700">{msg}</p> : null}

      {isLoading ? (
        <p className="flex items-center gap-2 text-slate-500">
          <Loader2 className="animate-spin" size={18} /> Đang tải...
        </p>
      ) : (
        <>
          <ListToolbar
            search={search}
            onSearchChange={setSearch}
            placeholder="Tìm tên xe, slug, tải trọng…"
            total={data?.length ?? 0}
            filtered={filtered.length}
            selectedCount={bulk.selectedCount}
            allSelected={bulk.allSelected}
            onSelectAll={bulk.selectAll}
            onClearSelection={bulk.clear}
            onDeleteSelected={() => {
              if (!bulk.selectedIds.length) return;
              if (window.confirm(`Xóa ${bulk.selectedIds.length} loại xe?`)) bulkDelMut.mutate(bulk.selectedIds);
            }}
            deleteLabel="Xóa đã chọn"
            deleting={bulkDelMut.isPending}
          />
          <div className="grid gap-3 md:grid-cols-2">
            {filtered.map((v) => (
              <div key={v.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-[#f8fafc]">
                <div className="relative aspect-[16/9] bg-slate-200">
                  <Image src={v.image} alt={v.title} fill className="object-cover" sizes="400px" />
                  {!v.published ? (
                    <span className="absolute left-2 top-2 rounded-full bg-slate-800/80 px-2 py-1 text-xs font-bold text-white">
                      Ẩn
                    </span>
                  ) : null}
                </div>
                <div className="flex gap-3 p-4">
                  <RowCheckbox checked={bulk.isSelected(v.id)} onChange={() => bulk.toggle(v.id)} />
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-[#102033]">{v.title}</p>
                    <Link href={`/${v.slug}`} target="_blank" className="text-sm font-bold text-[#2563eb]">
                      /{v.slug}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">
                      {v.capacity} · {v.size}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold"
                        onClick={() => toggleMut.mutate(v)}
                      >
                        {v.published ? (
                          <>
                            <EyeOff size={12} className="mr-1 inline" /> Ẩn
                          </>
                        ) : (
                          <>
                            <Eye size={12} className="mr-1 inline" /> Xuất bản
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600"
                        onClick={() => {
                          if (window.confirm(`Xóa ${v.title}?`)) delMut.mutate(v.id);
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {!filtered.length ? (
            <p className="mt-4 text-sm text-slate-500">Chưa có loại xe — thêm mới hoặc chạy SQL seed 018.</p>
          ) : null}
        </>
      )}
    </section>
  );
}
