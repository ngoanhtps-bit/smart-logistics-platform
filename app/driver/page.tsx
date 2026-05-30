import type { Metadata } from "next";
import { DashboardAuthGuard } from "@/components/dashboard-auth-guard";
import { DashboardShell } from "@/components/dashboard-shell";
import { DriverDashboard } from "@/components/driver-dashboard";

export const metadata: Metadata = {
  title: "App tài xế",
  description: "Nhận chuyến, GPS, cập nhật trạng thái, upload POD và chat điều phối."
};

export default function DriverPage() {
  return (
    <DashboardAuthGuard>
      <DashboardShell title="App tài xế">
        <DriverDashboard />
      </DashboardShell>
    </DashboardAuthGuard>
  );
}
