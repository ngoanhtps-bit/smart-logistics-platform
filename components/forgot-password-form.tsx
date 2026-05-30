"use client";

import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Gửi email thất bại");
        return;
      }
      setMessage(data.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="shell mx-auto max-w-md rounded-3xl p-8" onSubmit={onSubmit}>
      <p className="text-sm font-black uppercase tracking-[0.12em] text-[#2563eb]">Khôi phục mật khẩu</p>
      <h1 className="mt-2 text-3xl font-black text-[#102033]">Quên mật khẩu?</h1>
      <p className="mt-2 text-sm text-slate-600">Nhập email đăng ký — chúng tôi gửi link đặt lại mật khẩu.</p>

      <label className="mt-6 block">
        <span className="text-xs font-bold uppercase text-slate-500">Email</span>
        <input
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      {error ? <p className="mt-3 text-sm font-bold text-red-600">{error}</p> : null}
      {message ? <p className="mt-3 text-sm font-bold text-emerald-700">{message}</p> : null}

      <button className="btn-primary mt-6 w-full" type="submit" disabled={loading}>
        {loading ? "Đang gửi..." : "Gửi link đặt lại"}
      </button>

      <p className="mt-4 text-center text-sm text-slate-500">
        <Link className="font-bold text-[#2563eb]" href="/login">
          ← Quay lại đăng nhập
        </Link>
      </p>
    </form>
  );
}
