import type { Metadata } from "next";
import { CustomerWorkspace } from "@/components/customer-workspace";
import { DashboardAuthGuard } from "@/components/dashboard-auth-guard";
import { RoleWorkspaceShell } from "@/components/role-workspace-shell";

export const metadata: Metadata = {
  title: "Không gian khách hàng",
  description: "Tạo đơn, hành trình 6 bước, theo dõi GPS — liên kết điều phối & tài xế."
};

export default function CustomerPage() {
  return (
    <DashboardAuthGuard>
      <RoleWorkspaceShell workspace="customer" title="Khách hàng">
        <CustomerWorkspace />
      </RoleWorkspaceShell>
    </DashboardAuthGuard>
  );
}
