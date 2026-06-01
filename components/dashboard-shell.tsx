import Link from "next/link";
import { DashboardNav, DashboardSidebarExtras } from "@/components/dashboard-nav";
import { DashboardUserMenu } from "@/components/dashboard-user-menu";
import { NotificationsPanel } from "@/components/notifications-panel";
import { CrossRoleSyncBanner } from "@/components/cross-role-sync-banner";
import { SyncStatusBadge } from "@/components/sync-status-badge";

export function DashboardShell({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-[#0f1f32] p-5 text-white lg:block">
        <Link href="/" className="text-xl font-black">Logistics Thông minh</Link>
        <DashboardNav />
        <DashboardSidebarExtras />
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/88 backdrop-blur-xl">
          <div className="flex h-[72px] items-center justify-between px-4 md:px-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#2563eb]">Trung tâm vận hành</p>
              <h1 className="text-2xl font-black text-[#0b1f3a]">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <SyncStatusBadge />
              <NotificationsPanel />
              <DashboardUserMenu />
            </div>
          </div>
        </header>
        <main className="p-4 md:p-8">
          <CrossRoleSyncBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
