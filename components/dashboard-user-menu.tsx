"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export function DashboardUserMenu() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) {
    return (
      <Link className="btn-primary text-sm md:w-auto" href="/login">
        Đăng nhập
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/account"
        className="hidden items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#2563eb] md:flex"
      >
        <User size={16} />
        {user.name}
      </Link>
      <button
        className="btn-ghost text-sm"
        type="button"
        onClick={async () => {
          await logout();
          router.push("/login");
        }}
      >
        <LogOut size={16} /> Thoát
      </button>
    </div>
  );
}
