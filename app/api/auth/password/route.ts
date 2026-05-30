import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function POST(request: Request) {
  if (!getSupabaseConfig().enabled) {
    return NextResponse.json({ message: "Supabase chưa cấu hình" }, { status: 503 });
  }

  const session = await getSessionUser();
  if (!session) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

  const { password, confirmPassword } = await request.json();
  const pwd = String(password ?? "");
  const confirm = String(confirmPassword ?? "");

  if (pwd.length < 6) {
    return NextResponse.json({ message: "Mật khẩu tối thiểu 6 ký tự" }, { status: 400 });
  }
  if (pwd !== confirm) {
    return NextResponse.json({ message: "Mật khẩu xác nhận không khớp" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ message: "Lỗi kết nối" }, { status: 500 });

  const { error } = await supabase.auth.updateUser({ password: pwd });
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Đã cập nhật mật khẩu" });
}
