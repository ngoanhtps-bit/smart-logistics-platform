"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, XCircle } from "lucide-react";
import { Suspense } from "react";
import { accountStatusLabel } from "@/lib/auth/account-status";
import { roleLabelsVi } from "@/lib/vi-labels";
import { useAuthStore } from "@/store/auth";

function ChoDuyetInner() {
  const router = useRouter();
  const params = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const syncSession = useAuthStore((s) => s.syncSession);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    void syncSession();
  }, [syncSession]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.accountStatus === "approved") {
      const dest =
        user.role === "admin"
          ? "/admin"
          : user.role === "dispatcher"
            ? "/dispatcher"
            : user.role === "driver"
              ? "/driver"
              : "/customer";
      router.replace(dest);
    }
  }, [user, hydrated, router]);

  if (!hydrated || !user) {
    return <p className="text-center font-bold text-slate-500">Đang tải...</p>;
  }

  const rejected = user.accountStatus === "rejected" || params.get("rejected") === "1";

  return (
    <div className="shell rounded-3xl p-8 text-center">
      {rejected ? (
        <XCircle className="mx-auto text-red-500" size={48} />
      ) : (
        <Clock className="mx-auto text-amber-500" size={48} />
      )}
      <h1 className="mt-4 text-2xl font-black text-[#102033]">
        {rejected ? "Tài khoản chưa được duyệt" : "Đang chờ admin duyệt"}
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        <strong>{user.name}</strong> ({user.email})
        <br />
        Đăng ký vai trò: <strong>{roleLabelsVi[user.role] ?? user.role}</strong>
        <br />
        Trạng thái: <strong>{accountStatusLabel(user.accountStatus)}</strong>
      </p>
      {rejected ? (
        <p className="mt-4 text-sm text-slate-500">
          Liên hệ quản trị viên nếu bạn cho rằng đây là nhầm lẫn.
        </p>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          Sau khi admin duyệt tại <strong>Quản trị → Người dùng</strong>, bạn đăng xuất rồi đăng nhập lại để
          vào hệ thống.
        </p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          className="btn-ghost"
          type="button"
          onClick={() => {
            void syncSession();
          }}
        >
          Kiểm tra lại
        </button>
        <button
          className="btn-ghost text-red-600"
          type="button"
          onClick={() => void logout().then(() => router.push("/login"))}
        >
          Đăng xuất
        </button>
        <Link className="btn-primary" href="/">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

export function ChoDuyetClient() {
  return (
    <Suspense fallback={<p className="text-center font-bold text-slate-500">Đang tải...</p>}>
      <ChoDuyetInner />
    </Suspense>
  );
}
