"use client";

import Link from "next/link";
import { useState } from "react";
import { canAccessDashboard } from "@/lib/auth/account-status";
import type { AuthUser, UserRole } from "@/types/logistics";
import { useAuthStore } from "@/store/auth";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { getSupabaseConfig } from "@/lib/supabase/config";

const roleRedirects: Record<UserRole, string> = {
  customer: "/customer",
  dispatcher: "/dispatcher",
  admin: "/admin",
  driver: "/driver"
};

function redirectAfterAuth(user: AuthUser | null, fallback?: string | null) {
  if (!user) {
    window.location.assign("/");
    return;
  }
  if (!canAccessDashboard(user)) {
    window.location.assign("/cho-duyet");
    return;
  }
  if (fallback?.startsWith("/")) {
    window.location.assign(fallback);
    return;
  }
  window.location.assign(roleRedirects[user.role] ?? "/customer");
}

const REGISTER_ROLES: UserRole[] = ["customer", "dispatcher", "driver"];

export function AuthForm({
  mode,
  defaultRole
}: {
  mode: "login" | "register";
  defaultRole?: UserRole;
}) {
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const [email, setEmail] = useState(defaultRole ? `${defaultRole}@demo.vn` : "");
  const [password, setPassword] = useState(defaultRole ? "demo1234" : "");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const initialRole =
    defaultRole && REGISTER_ROLES.includes(defaultRole) ? defaultRole : "customer";
  const [role, setRole] = useState<UserRole>(mode === "login" ? (defaultRole ?? "customer") : initialRole);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      if (mode === "register") {
        if (password.length < 6) {
          setError("Mật khẩu tối thiểu 6 ký tự");
          return;
        }
        if (password !== confirmPassword) {
          setError("Mật khẩu xác nhận không khớp");
          return;
        }
        const result = await register({
          email,
          password,
          name,
          phone: phone || undefined,
          role
        });
        if (!result.ok) {
          setError(result.message ?? "Đăng ký thất bại");
          return;
        }
        if (result.needsEmailConfirm) {
          setInfo(result.message ?? "Kiểm tra email để xác nhận tài khoản, sau đó đăng nhập.");
          return;
        }
        if (result.pendingApproval || result.message) {
          setInfo(result.message ?? "Đăng ký thành công. Chờ admin duyệt tài khoản.");
        }
        const user = useAuthStore.getState().user;
        redirectAfterAuth(user);
        return;
      }

      const result = await login(email, password, role);
      if (!result.ok) {
        setError(
          result.message?.includes("Invalid login")
            ? "Sai email/mật khẩu hoặc tài khoản chưa có trong Supabase Auth. Chạy npm run seed:auth-demo hoặc đăng ký mới tại /register."
            : (result.message ?? "Email hoặc mật khẩu không hợp lệ")
        );
        return;
      }

      const user = useAuthStore.getState().user;
      const redirect =
        typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") : null;
      redirectAfterAuth(user, redirect);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="shell mx-auto max-w-md rounded-3xl p-8" onSubmit={onSubmit}>
      <p className="text-sm font-black uppercase tracking-[0.12em] text-[#2563eb]">
        {mode === "login" ? "Đăng nhập" : "Đăng ký"}
      </p>
      <h1 className="mt-2 text-3xl font-black text-[#102033]">
        {mode === "login" ? "Truy cập nền tảng" : "Đăng ký tài khoản"}
      </h1>

      {mode === "login" ? (
        <label className="mt-6 block">
          <span className="text-xs font-bold uppercase text-slate-500">Vai trò (chỉ bắt buộc với *@demo.vn)</span>
          <select
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold"
            value={role}
            onChange={(e) => {
              const r = e.target.value as UserRole;
              setRole(r);
              if (email.endsWith("@demo.vn")) setEmail(`${r}@demo.vn`);
            }}
          >
            <option value="customer">Khách hàng</option>
            <option value="dispatcher">Điều phối</option>
            <option value="admin">Quản trị</option>
            <option value="driver">Tài xế</option>
          </select>
        </label>
      ) : (
        <>
          <label className="mt-6 block">
            <span className="text-xs font-bold uppercase text-slate-500">Bạn là</span>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="customer">Khách hàng (vào ngay)</option>
              <option value="dispatcher">Điều phối (cần admin duyệt)</option>
              <option value="driver">Tài xế (cần admin duyệt)</option>
            </select>
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-bold uppercase text-slate-500">Họ tên</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-bold uppercase text-slate-500">Số điện thoại (tuỳ chọn)</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
        </>
      )}

      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase text-slate-500">Email</span>
        <input
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={mode === "register" ? "you@company.vn" : "customer@demo.vn"}
          required
        />
      </label>

      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase text-slate-500">Mật khẩu</span>
        <input
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={mode === "register" ? 6 : 4}
          required
        />
      </label>

      {mode === "register" ? (
        <label className="mt-4 block">
          <span className="text-xs font-bold uppercase text-slate-500">Xác nhận mật khẩu</span>
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
      ) : null}

      {error ? <p className="mt-3 text-sm font-bold text-red-600">{error}</p> : null}
      {info ? <p className="mt-3 text-sm font-bold text-emerald-700">{info}</p> : null}

      {getSupabaseConfig().enabled ? (
        <div className="mt-6">
          <GoogleSignInButton
            label={mode === "login" ? "Đăng nhập bằng Google" : "Đăng ký bằng Google"}
          />
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs font-bold uppercase tracking-wide text-slate-400">
              <span className="bg-white px-3">hoặc email</span>
            </div>
          </div>
        </div>
      ) : null}

      <button className="btn-primary mt-6 w-full" type="submit" disabled={loading}>
        {loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Đăng ký"}
      </button>

      {mode === "login" ? (
        <p className="mt-3 text-center text-sm">
          <Link className="font-bold text-[#2563eb]" href="/forgot-password">
            Quên mật khẩu?
          </Link>
        </p>
      ) : null}

      <p className="mt-4 text-center text-sm text-slate-500">
        {mode === "login" ? (
          <>
            Chưa có tài khoản? <Link className="font-bold text-[#2563eb]" href="/register">Đăng ký</Link>
          </>
        ) : (
          <>
            Đã có tài khoản? <Link className="font-bold text-[#2563eb]" href="/login">Đăng nhập</Link>
          </>
        )}
      </p>

      {mode === "login" ? (
        <p className="mt-6 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
          <strong>Google/email:</strong> quyền lấy từ bảng <code>users</code> (admin cấp trong Supabase). Không cần chọn đúng
          dropdown — sau khi được gán <code>admin</code>, đăng xuất rồi đăng nhập lại → /admin.
        </p>
      ) : (
        <p className="mt-6 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
          <strong>Điều phối</strong> và <strong>tài xế</strong> đăng ký xong sẽ ở trạng thái <em>chờ duyệt</em> — admin
          phê duyệt tại Quản trị → Người dùng. Khách hàng dùng được ngay sau khi đăng ký.
        </p>
      )}
    </form>
  );
}
