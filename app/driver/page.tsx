import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardAuthGuard } from "@/components/dashboard-auth-guard";
import { DriverAppShell } from "@/components/driver-app-shell";
import { DriverDashboard } from "@/components/driver-dashboard";

export const metadata: Metadata = {
  title: "App tài xế",
  description: "Chốt chuyến, GPS tự động, cập nhật trạng thái — giao diện riêng cho tài xế."
};

export default function DriverPage() {
  return (
    <DashboardAuthGuard>
      <DriverAppShell>
        <Suspense fallback={<p className="font-bold text-slate-500">Đang mở app tài xế…</p>}>
          <DriverDashboard />
        </Suspense>
      </DriverAppShell>
    </DashboardAuthGuard>
  );
}
