"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { roleLabelsVi } from "@/lib/vi-labels";

export function AccountProfileForm() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone ?? "");
    }
  }, [user]);

  if (!user) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Cập nhật thất bại");
        return;
      }
      setUser(data.user);
      setMessage("Đã lưu thông tin tài khoản");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="rounded-3xl border border-slate-200 bg-white p-6" onSubmit={onSubmit}>
      <h2 className="text-xl font-black text-[#102033]">Thông tin tài khoản</h2>
      <p className="mt-1 text-sm text-slate-500">
        Vai trò: <strong>{roleLabelsVi[user.role] ?? user.role}</strong> · {user.email}
      </p>

      <label className="mt-6 block">
        <span className="text-xs font-bold uppercase text-slate-500">Họ tên</span>
        <input
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase text-slate-500">Số điện thoại</span>
        <input
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>

      {error ? <p className="mt-3 text-sm font-bold text-red-600">{error}</p> : null}
      {message ? <p className="mt-3 text-sm font-bold text-emerald-700">{message}</p> : null}

      <button className="btn-primary mt-6" type="submit" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" size={18} /> : "Lưu thay đổi"}
      </button>
    </form>
  );
}
