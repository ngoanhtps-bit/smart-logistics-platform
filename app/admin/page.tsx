import type { Metadata } from "next";
import { AdminCmsPanel } from "@/components/admin-cms-panel";
import { DashboardAuthGuard } from "@/components/dashboard-auth-guard";
import { DashboardShell } from "@/components/dashboard-shell";

export const metadata: Metadata = {
  title: "Quản trị hệ thống",
  description: "Quản lý trang SEO, bảng giá, blog, tuyến và loại xe."
};

export default function AdminPage() {
  return (
    <DashboardAuthGuard>
      <DashboardShell title="Quản trị hệ thống">
        <AdminCmsPanel />
      </DashboardShell>
    </DashboardAuthGuard>
  );
}
