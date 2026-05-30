"use client";

import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function AccountPasswordForm() {
  const searchParams = useSearchParams();
  const fromReset = searchParams.get("reset") === "1";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password, confirmPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Cập nhật thất bại");
        return;
      }
      setMessage(data.message ?? "Đã đổi mật khẩu");
      setPassword("");
      setConfirmPassword("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="rounded-3xl border border-slate-200 bg-white p-6" onSubmit={onSubmit}>
      <h2 className="text-xl font-black text-[#102033]">Mật khẩu</h2>
      {fromReset ? (
        <p className="mt-1 text-sm font-semibold text-emerald-700">
          Bạn vừa xác nhận email — nhập mật khẩu mới bên dưới.
        </p>
      ) : (
        <p className="mt-1 text-sm text-slate-500">Đổi mật khẩu đăng nhập Supabase.</p>
      )}

      <label className="mt-6 block">
        <span className="text-xs font-bold uppercase text-slate-500">Mật khẩu mới</span>
        <input
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
      </label>

      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase text-slate-500">Xác nhận</span>
        <input
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </label>

      {error ? <p className="mt-3 text-sm font-bold text-red-600">{error}</p> : null}
      {message ? <p className="mt-3 text-sm font-bold text-emerald-700">{message}</p> : null}

      <button className="btn-secondary mt-6" type="submit" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" size={18} /> : "Lưu mật khẩu"}
      </button>
    </form>
  );
}
