"use client";

import Link from "next/link";
import { DashboardNav, DashboardSidebarExtras } from "@/components/dashboard-nav";
import { DashboardUserMenu } from "@/components/dashboard-user-menu";
import { NotificationsPanel } from "@/components/notifications-panel";
import { ShipmentFlowStrip } from "@/components/shipment-flow-strip";
import { SyncStatusBadge } from "@/components/sync-status-badge";
import { roleLabelsVi } from "@/lib/vi-labels";
import { roleHomePath } from "@/lib/navigation/shipment-links";
import { useAuthStore } from "@/store/auth";
import type { UserRole } from "@/types/logistics";

type WorkspaceRole = Extract<UserRole, "dispatcher" | "customer" | "driver">;

const themes: Record<
  WorkspaceRole,
  { accent: string; badge: string; subtitle: string; gradient: string }
> = {
  dispatcher: {
    accent: "text-[#2563eb]",
    badge: "bg-[#2563eb]/15 text-[#174ea6]",
    subtitle: "Gán xe · gửi chốt app · điều khiển SLA",
    gradient: "from-[#eef5ff] to-white"
  },
  customer: {
    accent: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-900",
    subtitle: "Đặt đơn · theo dõi hành trình · hóa đơn",
    gradient: "from-emerald-50 to-white"
  },
  driver: {
    accent: "text-orange-600",
    badge: "bg-orange-100 text-orange-900",
    subtitle: "Chốt chuyến · GPS · cập nhật trạng thái · POD",
    gradient: "from-orange-50 to-white"
  }
};

export function RoleWorkspaceShell({
  workspace,
  title,
  children,
  focusCode
}: {
  workspace: WorkspaceRole;
  title: string;
  children: React.ReactNode;
  focusCode?: string | null;
}) {
  const role = useAuthStore((s) => s.user?.role);
  const theme = themes[workspace];

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-[#0f1f32] p-5 text-white lg:block">
        <Link href={roleHomePath(workspace)} className="text-xl font-black">
          Logistics
        </Link>
        <p className={`mt-1 text-xs font-bold ${theme.accent}`}>{roleLabelsVi[workspace]}</p>
        <DashboardNav />
        <DashboardSidebarExtras />
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
          <div className="flex h-[72px] items-center justify-between px-4 md:px-8">
            <div>
              <span className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase ${theme.badge}`}>
                {roleLabelsVi[workspace]}
              </span>
              <h1 className="text-2xl font-black text-[#0b1f3a]">{title}</h1>
              <p className="text-xs font-semibold text-slate-500">{theme.subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <SyncStatusBadge />
              <NotificationsPanel />
              <DashboardUserMenu />
            </div>
          </div>
        </header>
        <main className="p-4 md:p-8">
          <div className={`mb-6 rounded-3xl border border-slate-200 bg-gradient-to-br p-4 ${theme.gradient}`}>
            <ShipmentFlowStrip role={role ?? workspace} trackingCode={focusCode ?? undefined} />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
