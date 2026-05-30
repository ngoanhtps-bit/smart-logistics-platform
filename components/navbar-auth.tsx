"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth";

export function NavbarAuth() {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  if (!hydrated) {
    return <Link className="btn-ghost" href="/login">Đăng nhập</Link>;
  }

  if (!user) {
    return (
      <>
        <Link className="btn-ghost" href="/login">
          Đăng nhập
        </Link>
        <Link className="btn-ghost hidden sm:inline-flex" href="/register">
          Đăng ký
        </Link>
      </>
    );
  }

  return (
    <>
      {user.role === "admin" ? (
        <Link className="btn-ghost hidden text-[#2563eb] sm:inline-flex" href="/admin">
          Quản trị
        </Link>
      ) : null}
      <Link className="btn-ghost max-w-[140px] truncate" href="/account" title={user.email}>
        {user.name}
      </Link>
    </>
  );
}
