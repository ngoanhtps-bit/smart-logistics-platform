"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ListToolbar } from "@/components/list-toolbar";
import { matchesSearch } from "@/lib/list-search";

type Row = { route: string; container20: string; container40: string; eta: string; slug?: string };

export function AdminPricingTab({ globalSearch = "" }: { globalSearch?: string }) {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["pricing-routes"],
    queryFn: () => fetch("/api/pricing/routes").then((r) => r.json() as Promise<Row[]>)
  });

  const combinedSearch = [globalSearch, search].filter(Boolean).join(" ");
  const filtered = useMemo(
    () => (data ?? []).filter((row) => matchesSearch(combinedSearch, [row.route, row.container20, row.container40, row.eta, row.slug])),
    [data, combinedSearch]
  );

  if (isLoading) {
    return (
      <div className="flex gap-2 py-8 text-slate-500">
        <Loader2 className="animate-spin" size={18} /> Đang tải bảng giá Supabase...
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-black">Route pricing (Supabase)</h2>
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">
          {data?.length ?? 0} tuyến
        </span>
      </div>
      <p className="mb-4 text-sm text-slate-500">
        Sửa giá trong Supabase Table Editor → <code>route_pricing</code> hoặc chạy SQL seed.
      </p>
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Tìm tuyến, giá 20/40FT, ETA…"
        total={data?.length ?? 0}
        filtered={filtered.length}
        selectedCount={0}
        allSelected={false}
        onSelectAll={() => {}}
        onClearSelection={() => {}}
      />
      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <div className="grid grid-cols-4 gap-2 bg-[#102033] px-4 py-2 text-xs font-black text-white">
          <span>Tuyến</span>
          <span>20FT</span>
          <span>40FT</span>
          <span>ETA</span>
        </div>
        {filtered.map((row) => (
          <div key={row.route} className="grid grid-cols-4 gap-2 border-t border-slate-100 px-4 py-3 text-sm">
            {row.slug ? (
              <Link href={`/tuyen/${row.slug}`} className="font-bold text-[#2563eb]">
                {row.route}
              </Link>
            ) : (
              <span className="font-bold">{row.route}</span>
            )}
            <span>{row.container20}</span>
            <span>{row.container40}</span>
            <span className="text-[#2563eb]">{row.eta}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
