import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountPasswordForm } from "@/components/account-password-form";
import { AccountProfileForm } from "@/components/account-profile-form";
import { DashboardAuthGuard } from "@/components/dashboard-auth-guard";
import { DashboardShell } from "@/components/dashboard-shell";

export const metadata: Metadata = {
  title: "Tài khoản",
  description: "Cập nhật thông tin cá nhân và mật khẩu."
};

export default function AccountPage() {
  return (
    <DashboardAuthGuard>
      <DashboardShell title="Tài khoản của tôi">
        <div className="grid gap-6 lg:grid-cols-2">
          <AccountProfileForm />
          <Suspense fallback={<div className="rounded-3xl border border-slate-200 bg-white p-6">Đang tải...</div>}>
            <AccountPasswordForm />
          </Suspense>
        </div>
      </DashboardShell>
    </DashboardAuthGuard>
  );
}
