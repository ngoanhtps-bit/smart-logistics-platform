"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useState } from "react";
import { AdminBlogTab } from "@/components/admin-blog-tab";
import { AdminPricingTab } from "@/components/admin-pricing-tab";
import { AdminRoutesTab } from "@/components/admin-routes-tab";
import { AdminUsersTab } from "@/components/admin-users-tab";
import { AdminVehiclesTab } from "@/components/admin-vehicles-tab";
import { AdminOperationsTab } from "@/components/admin-operations-tab";
import { AdminProductionPanel } from "@/components/admin-production-panel";
import { SupabaseLivePanel } from "@/components/supabase-live-panel";

type Tab = "routes" | "vehicles" | "pricing" | "blog" | "users" | "operations" | "system";

export function AdminCmsPanel() {
  const [tab, setTab] = useState<Tab>("routes");
  const [quickSearch, setQuickSearch] = useState("");

  const tabs: { id: Tab; label: string }[] = [
    { id: "routes", label: "Tuyến SEO" },
    { id: "vehicles", label: "Loại xe" },
    { id: "pricing", label: "Bảng giá" },
    { id: "blog", label: "Tin tức" },
    { id: "users", label: "Người dùng" },
    { id: "operations", label: "Vận hành" },
    { id: "system", label: "Hệ thống" }
  ];

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-[#1e3a5f]">
        <strong>Đăng nhập admin:</strong> dùng tài khoản Supabase Auth có role <code>admin</code> (chạy{" "}
        <code>npm run seed:auth-demo</code> rồi đăng nhập <code>admin@demo.vn</code> / <code>demo1234</code>).
        Nếu chỉ có user trong bảng <code>users</code> mà chưa có trong Auth → đăng nhập sẽ lỗi.
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2 text-sm font-black transition ${
              tab === t.id ? "bg-[#102033] text-white" : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {["routes", "pricing", "blog", "users", "vehicles"].includes(tab) ? (
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="search"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-semibold shadow-sm"
            placeholder="Tìm nhanh trong tab hiện tại (tuyến, loại xe, bài viết…)"
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
          />
        </div>
      ) : null}

      {tab === "routes" ? <AdminRoutesTab globalSearch={quickSearch} /> : null}
      {tab === "pricing" ? <AdminPricingTab globalSearch={quickSearch} /> : null}
      {tab === "blog" ? <AdminBlogTab globalSearch={quickSearch} /> : null}

      {tab === "vehicles" ? <AdminVehiclesTab globalSearch={quickSearch} /> : null}

      {tab === "users" ? <AdminUsersTab globalSearch={quickSearch} /> : null}

      {tab === "operations" ? <AdminOperationsTab /> : null}

      {tab === "system" ? (
        <div className="grid gap-6">
          <AdminProductionPanel />
          <SupabaseLivePanel />
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-black">SQL cần chạy (theo thứ tự)</h2>
            <ul className="mt-4 grid gap-1 font-mono text-xs text-slate-600">
              <li>010_operational_tables.sql · 011_operational_rls.sql</li>
              <li>012_invoices.sql · 013_storage_documents.sql</li>
              <li>019 chốt chuyến · 020 nhật ký · <strong>021_realtime_sync_tables.sql</strong> (Realtime đồng bộ 4 vai trò)</li>
            </ul>
          </section>
        </div>
      ) : null}
    </div>
  );
}
