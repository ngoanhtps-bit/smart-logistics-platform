import type { Metadata } from "next";
import { DashboardAuthGuard } from "@/components/dashboard-auth-guard";
import { DashboardShell } from "@/components/dashboard-shell";
import { MarketplaceBoard } from "@/components/marketplace-board";

export const metadata: Metadata = {
  title: "Sàn ghép chuyến",
  description: "Ghép chuyến, đặt giá thầu, giảm xe rỗng và tối ưu chiều về."
};

export default function MarketplacePage() {
  return (
    <DashboardAuthGuard>
      <DashboardShell title="Sàn ghép chuyến">
        <MarketplaceBoard />
      </DashboardShell>
    </DashboardAuthGuard>
  );
}
