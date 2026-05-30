"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { ListToolbar, RowCheckbox } from "@/components/list-toolbar";
import { useBulkSelect } from "@/hooks/use-bulk-select";
import { matchesSearch } from "@/lib/list-search";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  published: boolean;
};

const empty = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "Logistics",
  readTime: "5 phút",
  published: true
};

export function AdminBlogTab({ globalSearch = "" }: { globalSearch?: string }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: async () => {
      const res = await fetch("/api/admin/blog", { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Lỗi tải blog");
      return json as Post[];
    }
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Lưu thất bại");
      return json;
    },
    onSuccess: (post: Post) => {
      setMsg(`Đã đăng bài — xem /blog/${post.slug}`);
      setForm(empty);
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
    },
    onError: (e) => setMsg((e as Error).message)
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Xóa thất bại");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-blog"] })
  });

  const combinedSearch = [globalSearch, search].filter(Boolean).join(" ");
  const filtered = useMemo(
    () =>
      (data ?? []).filter((p) =>
        matchesSearch(combinedSearch, [p.title, p.slug, p.excerpt, p.category])
      ),
    [data, combinedSearch]
  );
  const bulk = useBulkSelect(filtered);

  const bulkDelMut = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        const res = await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE", credentials: "include" });
        if (!res.ok) throw new Error("Xóa thất bại");
      }
    },
    onSuccess: () => {
      bulk.clear();
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
    }
  });

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Bài viết tin tức</h2>
          <p className="text-sm text-slate-500">Cần chạy SQL `014_cms_blog.sql` trên Supabase trước lần đầu.</p>
        </div>
        <button className="btn-primary text-sm md:w-auto" type="button" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> {showForm ? "Đóng" : "Viết bài mới"}
        </button>
      </div>

      {error ? (
        <p className="rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-800">
          {(error as Error).message}. Đăng nhập admin + chạy `supabase/014_cms_blog.sql`.
        </p>
      ) : null}

      {showForm ? (
        <div className="mb-6 grid gap-3 rounded-2xl border border-blue-100 bg-[#f8fbff] p-4">
          <input className="rounded-xl border px-3 py-2 text-sm font-semibold" placeholder="Tiêu đề" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="rounded-xl border px-3 py-2 text-sm font-semibold" placeholder="Slug (tuỳ chọn)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <input className="rounded-xl border px-3 py-2 text-sm font-semibold" placeholder="Chuyên mục" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <textarea className="min-h-[80px] rounded-xl border px-3 py-2 text-sm font-semibold" placeholder="Mô tả ngắn (SEO)" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          <textarea className="min-h-[200px] rounded-xl border px-3 py-2 text-sm font-semibold" placeholder="Nội dung bài viết" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Xuất bản ngay
          </label>
          <button className="btn-primary" type="button" disabled={saveMut.isPending || !form.title || !form.excerpt} onClick={() => saveMut.mutate()}>
            {saveMut.isPending ? <Loader2 className="animate-spin" size={18} /> : "Đăng bài"}
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
            placeholder="Tìm tiêu đề, slug, chuyên mục…"
            total={data?.length ?? 0}
            filtered={filtered.length}
            selectedCount={bulk.selectedCount}
            allSelected={bulk.allSelected}
            onSelectAll={bulk.selectAll}
            onClearSelection={bulk.clear}
            onDeleteSelected={() => {
              if (!bulk.selectedIds.length) return;
              if (window.confirm(`Xóa ${bulk.selectedIds.length} bài viết?`)) bulkDelMut.mutate(bulk.selectedIds);
            }}
            deleteLabel="Xóa bài đã chọn"
            deleting={bulkDelMut.isPending}
          />
        <div className="grid gap-3">
          {filtered.map((post) => (
            <div key={post.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#f8fafc] p-4">
              <RowCheckbox checked={bulk.isSelected(post.id)} onChange={() => bulk.toggle(post.id)} />
              <div className="min-w-0 flex-1">
                <p className="font-black">{post.title}</p>
                <Link href={`/blog/${post.slug}`} className="text-sm font-bold text-[#2563eb]">
                  /blog/{post.slug}
                </Link>
                <p className="text-xs text-slate-500">{post.published ? "Đã xuất bản" : "Nháp"}</p>
              </div>
              <button className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600" type="button" onClick={() => delMut.mutate(post.id)}>
                Xóa
              </button>
            </div>
          ))}
        </div>
        </>
      )}
    </section>
  );
}
