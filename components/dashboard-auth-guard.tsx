"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { canAccessDashboard } from "@/lib/auth/account-status";
import type { UserRole } from "@/types/logistics";
import { useAuthStore } from "@/store/auth";

const routeRoles: Record<string, UserRole[]> = {
  "/customer": ["customer", "admin"],
  "/dispatcher": ["dispatcher", "admin"],
  "/admin": ["admin"],
  "/driver": ["driver", "admin"],
  "/marketplace": ["dispatcher", "admin", "customer"]
};

export function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const syncSession = useAuthStore((s) => s.syncSession);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await syncSession();
      if (!cancelled) setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [syncSession]);

  useEffect(() => {
    if (!hydrated || checking) return;

    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!canAccessDashboard(user)) {
      router.replace("/cho-duyet");
      return;
    }
    const base = Object.keys(routeRoles).find((r) => pathname.startsWith(r));
    if (base) {
      const allowed = routeRoles[base];
      if (!allowed.includes(user.role)) {
        router.replace("/");
      }
    }
  }, [user, pathname, router, hydrated, checking]);

  if (!hydrated || checking) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="font-bold text-slate-500">Đang kiểm tra phiên đăng nhập...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="font-bold text-slate-500">Đang chuyển đến trang đăng nhập...</p>
      </div>
    );
  }

  if (!canAccessDashboard(user)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="font-bold text-slate-500">Đang chuyển đến trang chờ duyệt...</p>
      </div>
    );
  }

  const base = Object.keys(routeRoles).find((r) => pathname.startsWith(r));
  if (base && !routeRoles[base].includes(user.role)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="font-bold text-slate-500">Bạn không có quyền truy cập trang này.</p>
      </div>
    );
  }

  return <>{children}</>;
}

export function LoginPrompt() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
      <p className="font-bold text-slate-600">Vui lòng đăng nhập để truy cập.</p>
      <Link className="btn-primary mt-4 inline-flex" href="/login">
        Đăng nhập
      </Link>
    </div>
  );
}
