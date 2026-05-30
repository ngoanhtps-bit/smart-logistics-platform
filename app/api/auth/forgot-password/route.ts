import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function POST(request: Request) {
  if (!getSupabaseConfig().enabled) {
    return NextResponse.json({ message: "Supabase chưa được cấu hình" }, { status: 503 });
  }

  const { email } = await request.json();
  const normalized = String(email ?? "").trim().toLowerCase();
  if (!normalized) {
    return NextResponse.json({ message: "Vui lòng nhập email" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: "Không kết nối được Supabase" }, { status: 500 });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const { error } = await supabase.auth.resetPasswordForEmail(normalized, {
    redirectTo: `${origin}/auth/callback?next=/account`
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    message: "Đã gửi link đặt lại mật khẩu vào email (nếu tài khoản tồn tại)."
  });
}
