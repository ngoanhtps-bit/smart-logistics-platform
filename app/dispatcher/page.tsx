import type { Metadata } from "next";
import { DashboardAuthGuard } from "@/components/dashboard-auth-guard";
import { RoleWorkspaceShell } from "@/components/role-workspace-shell";
import { DispatchBoard } from "@/components/dispatch-board";

export const metadata: Metadata = {
  title: "Trung tâm điều phối",
  description: "Gán xe, gửi chốt app tài xế, điều khiển SLA — tách riêng từng luồng."
};

export default function DispatcherPage() {
  return (
    <DashboardAuthGuard>
      <RoleWorkspaceShell workspace="dispatcher" title="Trung tâm điều phối">
        <DispatchBoard />
      </RoleWorkspaceShell>
    </DashboardAuthGuard>
  );
}
