"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Truck } from "lucide-react";
import { DriverBottomNav } from "@/components/driver-bottom-nav";
import { NotificationsPanel } from "@/components/notifications-panel";
import { ShipmentFlowStrip } from "@/components/shipment-flow-strip";
import { SyncStatusBadge } from "@/components/sync-status-badge";
import { DashboardUserMenu } from "@/components/dashboard-user-menu";
import { useAuthStore } from "@/store/auth";

export function DriverAppShell({
  children,
  focusCode
}: {
  children: React.ReactNode;
  focusCode?: string | null;
}) {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.user?.role);
  const onTrip = pathname.startsWith("/driver/trip/");

  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-24 lg:pb-8">
      <header className="sticky top-0 z-40 border-b border-orange-200 bg-gradient-to-r from-[#102033] to-[#1a3352] text-white shadow-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-orange-500">
              <Truck size={22} />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-orange-300">App tài xế</p>
              <h1 className="text-lg font-black leading-tight">Chuyến & GPS</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SyncStatusBadge />
            <NotificationsPanel />
            <DashboardUserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5">
        {!onTrip ? (
          <div className="mb-5 rounded-2xl border border-orange-200 bg-white p-3">
            <ShipmentFlowStrip role={role ?? "driver"} trackingCode={focusCode ?? undefined} />
          </div>
        ) : null}
        {children}
      </main>

      {!onTrip ? (
        <Suspense fallback={null}>
          <DriverBottomNav />
        </Suspense>
      ) : null}

      <div className="mx-auto mt-6 hidden max-w-3xl px-4 lg:block">
        <p className="text-center text-xs text-slate-500">
          <Link href="/driver?tab=pending" className="font-bold text-orange-600">
            Chốt chuyến
          </Link>
          {" · "}
          <Link href="/driver?tab=active" className="font-bold text-orange-600">
            Đang chạy
          </Link>
          {" · "}
          <Link href="/dispatcher" className="font-bold text-[#2563eb]">
            Liên hệ điều phối
          </Link>
        </p>
      </div>
    </div>
  );
}
