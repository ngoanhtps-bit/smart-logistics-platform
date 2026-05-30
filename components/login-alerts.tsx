"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const messages: Record<string, string> = {
  missing_code: "Liên kết xác thực không hợp lệ. Thử đăng nhập lại.",
  auth_callback: "Xác thực thất bại. Kiểm tra Redirect URL trên Supabase (phải có /auth/callback).",
  supabase: "Chưa cấu hình Supabase trên server."
};

function LoginAlertsInner() {
  const params = useSearchParams();
  const error = params.get("error");
  if (!error) return null;
  return (
    <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
      {messages[error] ?? "Đăng nhập thất bại."}
    </p>
  );
}

export function LoginAlerts() {
  return (
    <Suspense fallback={null}>
      <LoginAlertsInner />
    </Suspense>
  );
}
