"use client";



import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Link from "next/link";

import { Loader2, Pencil, Plus, X } from "lucide-react";

import { useMemo, useState } from "react";
import { ListToolbar, RowCheckbox } from "@/components/list-toolbar";
import { useBulkSelect } from "@/hooks/use-bulk-select";
import { matchesSearch } from "@/lib/list-search";



type Route = {

  id: string;

  slug: string;

  title: string;

  fromCity: string;

  toCity: string;

  container20: string;

  container40: string;

  transitDays: string;

};



const empty = {

  fromCity: "",

  toCity: "",

  slug: "",

  container20: "",

  container40: "",

  transitDays: "3-4 ngày"

};



function routeToEditForm(route: Route) {

  return {

    container20: route.container20 === "—" ? "" : route.container20,

    container40: route.container40 === "—" ? "" : route.container40,

    transitDays: route.transitDays === "—" ? "" : route.transitDays

  };

}



export function AdminRoutesTab({ globalSearch = "" }: { globalSearch?: string }) {

  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState(empty);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({ container20: "", container40: "", transitDays: "" });

  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");



  const { data, isLoading, error } = useQuery({

    queryKey: ["admin-routes"],

    queryFn: async () => {

      const res = await fetch("/api/admin/routes", { credentials: "include" });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message ?? "Lỗi tải tuyến");

      return json as Route[];

    }

  });



  const saveMut = useMutation({

    mutationFn: async () => {

      const res = await fetch("/api/admin/routes", {

        method: "POST",

        credentials: "include",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(form)

      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message ?? "Lưu thất bại");

      return json;

    },

    onSuccess: () => {

      setMsg("Đã thêm tuyến mới.");

      setForm(empty);

      setShowForm(false);

      qc.invalidateQueries({ queryKey: ["admin-routes"] });

      qc.invalidateQueries({ queryKey: ["pricing-routes"] });

    },

    onError: (e) => setMsg((e as Error).message)

  });



  const patchMut = useMutation({

    mutationFn: async ({ id, payload }: { id: string; payload: typeof editForm }) => {

      const res = await fetch("/api/admin/routes", {

        method: "PATCH",

        credentials: "include",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ id, ...payload })

      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message ?? "Cập nhật thất bại");

      return json;

    },

    onSuccess: () => {

      setMsg("Đã cập nhật giá & loại cont — trang /tuyen và bảng giá cập nhật sau vài giây.");

      setEditingId(null);

      qc.invalidateQueries({ queryKey: ["admin-routes"] });

      qc.invalidateQueries({ queryKey: ["pricing-routes"] });

    },

    onError: (e) => setMsg((e as Error).message)

  });



  const delMut = useMutation({

    mutationFn: async (id: string) => {

      const res = await fetch(`/api/admin/routes?id=${id}`, { method: "DELETE", credentials: "include" });

      if (!res.ok) throw new Error("Xóa thất bại");

    },

    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-routes"] })

  });

  const combinedSearch = [globalSearch, search].filter(Boolean).join(" ");
  const filtered = useMemo(
    () =>
      (data ?? []).filter((r) =>
        matchesSearch(combinedSearch, [r.title, r.slug, r.fromCity, r.toCity, r.container20, r.container40])
      ),
    [data, combinedSearch]
  );
  const bulk = useBulkSelect(filtered);

  const bulkDelMut = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        const res = await fetch(`/api/admin/routes?id=${id}`, { method: "DELETE", credentials: "include" });
        if (!res.ok) throw new Error("Xóa thất bại");
      }
    },
    onSuccess: () => {
      bulk.clear();
      qc.invalidateQueries({ queryKey: ["admin-routes"] });
    }
  });

  function startEdit(route: Route) {

    setEditingId(route.id);

    setEditForm(routeToEditForm(route));

    setShowForm(false);

    setMsg("");

  }



  return (

    <section className="rounded-3xl border border-slate-200 bg-white p-6">

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

        <div>

          <h2 className="text-xl font-black">Trang tuyến SEO + bảng giá</h2>

          <p className="text-sm text-slate-500">

            Bấm <strong>Sửa</strong> để chỉnh giá cont 20FT/40FT — không cần thêm tuyến mới.

          </p>

        </div>

        <button className="btn-primary text-sm md:w-auto" type="button" onClick={() => setShowForm(!showForm)}>

          <Plus size={16} /> {showForm ? "Đóng form" : "Thêm tuyến mới"}

        </button>

      </div>



      {error ? (

        <p className="rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-800">

          {(error as Error).message}. Đăng nhập <strong>admin@demo.vn</strong> (Supabase Auth) hoặc chạy{" "}

          <code>npm run seed:auth-demo</code>.

        </p>

      ) : null}



      {showForm ? (

        <div className="mb-6 grid gap-3 rounded-2xl border border-blue-100 bg-[#f8fbff] p-4 md:grid-cols-2">

          <input className="rounded-xl border px-3 py-2 text-sm font-semibold" placeholder="Từ (Hải Phòng)" value={form.fromCity} onChange={(e) => setForm({ ...form, fromCity: e.target.value })} />

          <input className="rounded-xl border px-3 py-2 text-sm font-semibold" placeholder="Đến (Bình Dương)" value={form.toCity} onChange={(e) => setForm({ ...form, toCity: e.target.value })} />

          <input className="rounded-xl border px-3 py-2 text-sm font-semibold" placeholder="Slug (tuỳ chọn)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />

          <input className="rounded-xl border px-3 py-2 text-sm font-semibold" placeholder="Thời gian (3-4 ngày)" value={form.transitDays} onChange={(e) => setForm({ ...form, transitDays: e.target.value })} />

          <input className="rounded-xl border px-3 py-2 text-sm font-semibold" placeholder="Cont 20FT — vd: 17.1 triệu" value={form.container20} onChange={(e) => setForm({ ...form, container20: e.target.value })} />

          <input className="rounded-xl border px-3 py-2 text-sm font-semibold" placeholder="Cont 40FT — vd: 19.2 triệu" value={form.container40} onChange={(e) => setForm({ ...form, container40: e.target.value })} />

          <button className="btn-primary md:col-span-2" type="button" disabled={saveMut.isPending || !form.fromCity || !form.toCity} onClick={() => saveMut.mutate()}>

            {saveMut.isPending ? <Loader2 className="animate-spin" size={18} /> : "Lưu tuyến mới"}

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
            placeholder="Tìm tuyến, slug, thành phố…"
            total={data?.length ?? 0}
            filtered={filtered.length}
            selectedCount={bulk.selectedCount}
            allSelected={bulk.allSelected}
            onSelectAll={bulk.selectAll}
            onClearSelection={bulk.clear}
            onDeleteSelected={() => {
              if (!bulk.selectedIds.length) return;
              if (window.confirm(`Xóa ${bulk.selectedIds.length} tuyến SEO?`)) bulkDelMut.mutate(bulk.selectedIds);
            }}
            deleteLabel="Xóa tuyến đã chọn"
            deleting={bulkDelMut.isPending}
          />
        <div className="grid gap-3">

          {filtered.map((route) => (

            <div key={route.id} className="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4">

              <div className="flex flex-wrap items-start justify-between gap-3">
                <RowCheckbox checked={bulk.isSelected(route.id)} onChange={() => bulk.toggle(route.id)} />

                <div className="min-w-0 flex-1">

                  <p className="font-black text-[#0b1f3a]">{route.title}</p>

                  <Link href={`/tuyen/${route.slug}`} className="text-sm font-bold text-[#2563eb] hover:underline">

                    /tuyen/{route.slug}

                  </Link>

                  {editingId !== route.id ? (

                    <p className="mt-1 text-xs text-slate-500">

                      <span className="font-bold text-slate-600">20FT:</span> {route.container20}

                      <span className="mx-2">·</span>

                      <span className="font-bold text-slate-600">40FT:</span> {route.container40}

                      <span className="mx-2">·</span>

                      {route.transitDays}

                    </p>

                  ) : null}

                </div>

                <div className="flex gap-2">

                  {editingId === route.id ? (

                    <button

                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600"

                      type="button"

                      onClick={() => setEditingId(null)}

                    >

                      <X size={14} className="inline" /> Hủy

                    </button>

                  ) : (

                    <button

                      className="rounded-xl bg-[#2563eb]/10 px-3 py-2 text-sm font-bold text-[#2563eb]"

                      type="button"

                      onClick={() => startEdit(route)}

                    >

                      <Pencil size={14} className="inline" /> Sửa

                    </button>

                  )}

                  <button

                    className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600"

                    type="button"

                    disabled={route.id.startsWith("static-")}

                    title={route.id.startsWith("static-") ? "Tuyến tĩnh — thêm vào DB trước" : undefined}

                    onClick={() => delMut.mutate(route.id)}

                  >

                    Xóa

                  </button>

                </div>

              </div>



              {editingId === route.id ? (

                <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 md:grid-cols-3">

                  <label className="block md:col-span-1">

                    <span className="text-xs font-bold uppercase text-slate-500">Cont 20FT (giá / mô tả)</span>

                    <input

                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"

                      placeholder="17.1 triệu hoặc 20FT DC: 18 triệu"

                      value={editForm.container20}

                      onChange={(e) => setEditForm({ ...editForm, container20: e.target.value })}

                    />

                  </label>

                  <label className="block md:col-span-1">

                    <span className="text-xs font-bold uppercase text-slate-500">Cont 40FT (giá / mô tả)</span>

                    <input

                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"

                      placeholder="19.2 triệu hoặc 40FT HC: 21 triệu"

                      value={editForm.container40}

                      onChange={(e) => setEditForm({ ...editForm, container40: e.target.value })}

                    />

                  </label>

                  <label className="block md:col-span-1">

                    <span className="text-xs font-bold uppercase text-slate-500">Thời gian vận chuyển</span>

                    <input

                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"

                      placeholder="3-4 ngày"

                      value={editForm.transitDays}

                      onChange={(e) => setEditForm({ ...editForm, transitDays: e.target.value })}

                    />

                  </label>

                  <button

                    className="btn-primary md:col-span-3"

                    type="button"

                    disabled={patchMut.isPending || !editForm.container20 || !editForm.container40}

                    onClick={() => patchMut.mutate({ id: route.id, payload: editForm })}

                  >

                    {patchMut.isPending ? <Loader2 className="animate-spin" size={18} /> : "Lưu thay đổi"}

                  </button>

                </div>

              ) : null}

            </div>

          ))}

          {!filtered.length ? <p className="text-sm text-slate-500">Chưa có tuyến phù hợp — chạy SQL 006 hoặc thêm mới.</p> : null}

        </div>
        </>

      )}

    </section>

  );

}

