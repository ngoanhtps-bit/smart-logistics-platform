"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { AuthUser, UserRole } from "@/types/logistics";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  hydrated: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<{ ok: boolean; message?: string }>;
  register: (input: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: UserRole;
  }) => Promise<{
    ok: boolean;
    message?: string;
    needsEmailConfirm?: boolean;
    pendingApproval?: boolean;
  }>;
  logout: () => Promise<void>;
  syncSession: () => Promise<void>;
  setUser: (user: AuthUser | null, token?: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      hydrated: false,

      setUser: (user, token = null) => set({ user, token }),

      login: async (email, password, role) => {
        const normalizedEmail = email.trim().toLowerCase();

        if (getSupabaseConfig().enabled) {
          const supabase = createSupabaseBrowserClient();
          if (supabase) {
            const { error } = await supabase.auth.signInWithPassword({
              email: normalizedEmail,
              password
            });
            if (error) {
              const msg = error.message === "Invalid login credentials" ? "Sai email hoặc mật khẩu" : error.message;
              return { ok: false, message: msg };
            }

            const meRes = await fetch("/api/auth/me", {
              credentials: "include",
              cache: "no-store"
            });
            const meData = await meRes.json();
            if (meData.user) {
              if (role && meData.user.role !== role && normalizedEmail.endsWith("@demo.vn")) {
                await supabase.auth.signOut();
                return { ok: false, message: "Email không khớp vai trò đã chọn" };
              }
              if (meData.user.accountStatus === "rejected") {
                await supabase.auth.signOut();
                return { ok: false, message: "Tài khoản đã bị từ chối. Liên hệ quản trị." };
              }
              set({ user: meData.user, token: "supabase-session" });
              return { ok: true };
            }
          }
        }

        const res = await fetch("/api/auth/login", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail, password, role })
        });
        const data = await res.json();
        if (!res.ok) return { ok: false, message: data.message ?? "Đăng nhập thất bại" };
        set({ user: data.user, token: data.token ?? "supabase-session" });
        return { ok: true };
      },

      register: async ({ email, password, name, phone, role }) => {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, phone, role })
        });
        const data = await res.json();
        if (!res.ok) return { ok: false, message: data.message ?? "Đăng ký thất bại" };
        if (data.user && !data.needsEmailConfirm) {
          set({ user: data.user, token: "supabase-session" });
        }
        return {
          ok: true,
          message: data.message,
          needsEmailConfirm: data.needsEmailConfirm,
          pendingApproval: data.pendingApproval
        };
      },

      logout: async () => {
        await fetch("/api/auth/login", { method: "DELETE", credentials: "include" });
        set({ user: null, token: null });
      },

      syncSession: async () => {
        try {
          const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
          const data = await res.json();
          if (data.user) {
            set({ user: data.user, token: "supabase-session" });
            return;
          }
          if (res.status === 401) {
            set({ user: null, token: null });
          }
        } catch {
          /* giữ phiên local nếu mạng lỗi tạm thời */
        }
      }
    }),
    {
      name: "spl-auth",
      partialize: (s) => ({ user: s.user, token: s.token }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      }
    }
  )
);
