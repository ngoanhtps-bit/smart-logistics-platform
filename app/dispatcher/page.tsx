import type { Metadata } from "next";
import { DashboardAuthGuard } from "@/components/dashboard-auth-guard";
import { DashboardShell } from "@/components/dashboard-shell";
import { DispatchBoard } from "@/components/dispatch-board";

export const metadata: Metadata = {
  title: "Bảng điều phối thời gian thực",
  description: "Quản lý đơn, xe, tài xế, bản đồ trực tiếp, KPI và ghép chiều về."
};

export default function DispatcherPage() {
  return (
    <DashboardAuthGuard>
      <DashboardShell title="Bảng điều phối">
        <DispatchBoard />
      </DashboardShell>
    </DashboardAuthGuard>
  );
}
