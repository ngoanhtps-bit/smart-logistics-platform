import type { Metadata } from "next";
import { CustomerDashboard } from "@/components/customer-dashboard";
import { DashboardAuthGuard } from "@/components/dashboard-auth-guard";
import { DashboardShell } from "@/components/dashboard-shell";

export const metadata: Metadata = {
  title: "Bảng khách hàng",
  description: "Quản lý vận đơn, theo dõi, hóa đơn, chứng từ POD và thống kê của khách hàng."
};

export default function CustomerPage() {
  return (
    <DashboardAuthGuard>
      <DashboardShell title="Bảng khách hàng">
        <CustomerDashboard />
      </DashboardShell>
    </DashboardAuthGuard>
  );
}
