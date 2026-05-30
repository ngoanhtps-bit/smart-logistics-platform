"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { buildOAuthCallbackUrl } from "@/lib/auth/oauth";

type Props = {
  label?: string;
  redirectAfterLogin?: string | null;
};

function GoogleSignInButtonInner({
  label = "Tiếp tục bằng Google",
  redirectAfterLogin
}: Props) {
  const params = useSearchParams();
  const redirect =
    redirectAfterLogin?.startsWith("/") ? redirectAfterLogin : params.get("redirect");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onGoogleSignIn() {
    setError("");
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Chưa cấu hình Supabase (NEXT_PUBLIC_SUPABASE_URL và key).");
      setLoading(false);
      return;
    }

    const redirectTo = buildOAuthCallbackUrl(redirect?.startsWith("/") ? redirect : undefined);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { prompt: "select_account" }
      }
    });

    if (oauthError) {
      const msg = oauthError.message.toLowerCase();
      setError(
        msg.includes("not enabled") || msg.includes("provider")
          ? "Chưa bật Google trên Supabase. Xem mục «Đăng nhập Google» trong SUPABASE_SETUP.md."
          : oauthError.message
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-[#102033] shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        onClick={() => void onGoogleSignIn()}
        disabled={loading}
      >
        <GoogleIcon />
        {loading ? "Đang chuyển tới Google..." : label}
      </button>
      {error ? <p className="mt-2 text-sm font-bold text-red-600">{error}</p> : null}
    </div>
  );
}

export function GoogleSignInButton(props: Props) {
  return (
    <Suspense
      fallback={
        <button
          type="button"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-400"
          disabled
        >
          Đang tải...
        </button>
      }
    >
      <GoogleSignInButtonInner {...props} />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.083 36 24 36c-5.523 0-10-4.477-10-10s4.477-10 10-10c2.837 0 5.402 1.234 7.313 3.213l5.657-5.657C33.64 11.213 29.027 9 24 9 14.611 9 7 16.611 7 26s7.611 17 17 17c9.389 0 17-7.611 17-17 0-1.134-.115-2.242-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c2.837 0 5.402 1.234 7.313 3.213l5.657-5.657C33.64 11.213 29.027 9 24 9c-7.682 0-14.348 4.337-17.694 10.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 43c5.166 0 9.86-1.977 13.409-5.197l-6.19-5.238C29.211 34.091 26.715 35 24 35c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 43 24 43z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.219 8-11.303 8-5.523 0-10-4.477-10-10s4.477-10 10-10c2.837 0 5.402 1.234 7.313 3.213l5.657-5.657C33.64 11.213 29.027 9 24 9 14.611 9 7 16.611 7 26s7.611 17 17 17c9.389 0 17-7.611 17-17 0-1.134-.115-2.242-.389-3.917z"
      />
    </svg>
  );
}
