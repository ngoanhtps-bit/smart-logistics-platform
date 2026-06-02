import type { Metadata } from "next";
import { DashboardAuthGuard } from "@/components/dashboard-auth-guard";
import { DriverAppShell } from "@/components/driver-app-shell";
import { DriverTripDetail } from "@/components/driver-trip-detail";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return { title: `Chuyến ${code} · App tài xế` };
}

export default async function DriverTripPage({ params }: Props) {
  const { code } = await params;
  return (
    <DashboardAuthGuard>
      <DriverAppShell focusCode={code}>
        <DriverTripDetail code={code} />
      </DriverAppShell>
    </DashboardAuthGuard>
  );
}
