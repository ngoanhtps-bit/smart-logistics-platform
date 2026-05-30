import { NextResponse, type NextRequest } from "next/server";
import { resolveAuthUser, isSupabaseAuthEnabled } from "@/lib/auth/profile";
import {
  createSupabaseRouteClient,
  createSupabaseRouteClientWithCookieJar
} from "@/lib/supabase/route-handler";
import type { UserRole } from "@/types/logistics";

const demoUsers: Record<string, { id: string; role: UserRole; name: string }> = {
  "customer@demo.vn": { id: "u1", role: "customer", name: "Khách hàng Demo" },
  "dispatcher@demo.vn": { id: "u2", role: "dispatcher", name: "Điều phối Demo" },
  "admin@demo.vn": { id: "u3", role: "admin", name: "Quản trị Demo" },
  "driver@demo.vn": { id: "u4", role: "driver", name: "Tài xế Demo" }
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const role = body.role as UserRole | undefined;

  if (!email || !password) {
    return NextResponse.json({ message: "Thông tin không hợp lệ" }, { status: 400 });
  }

  if (isSupabaseAuthEnabled()) {
    const { supabase, applyCookies } = createSupabaseRouteClientWithCookieJar(request);
    if (!supabase) {
      return NextResponse.json({ message: "Không kết nối được Supabase" }, { status: 500 });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return NextResponse.json({ message: error.message === "Invalid login credentials" ? "Sai email hoặc mật khẩu" : error.message }, { status: 401 });
    }

    if (!data.user) {
      return NextResponse.json({ message: "Đăng nhập thất bại" }, { status: 401 });
    }

    const user = await resolveAuthUser(data.user);

    if (user.accountStatus === "rejected") {
      await supabase.auth.signOut();
      return NextResponse.json(
        { message: "Tài khoản đã bị từ chối. Liên hệ quản trị nếu cần hỗ trợ." },
        { status: 403 }
      );
    }

    // Chỉ kiểm tra dropdown vai trò với tài khoản demo — quyền thật lấy từ bảng users
    if (role && user.role !== role && email in demoUsers) {
      await supabase.auth.signOut();
      return NextResponse.json({ message: "Email không khớp vai trò đã chọn" }, { status: 403 });
    }

    const response = NextResponse.json({ user, token: data.session?.access_token ?? "supabase-session" });
    applyCookies(response);
    return response;
  }

  if (password.length < 4) {
    return NextResponse.json({ message: "Thông tin không hợp lệ" }, { status: 400 });
  }

  const demo = demoUsers[email];
  if (!demo) {
    return NextResponse.json({ message: "Sai email hoặc mật khẩu" }, { status: 401 });
  }
  if (role && demo.role !== role) {
    return NextResponse.json({ message: "Email không khớp vai trò" }, { status: 403 });
  }

  const user = { ...demo, email };
  const token = `demo-jwt-${demo.id}`;
  const res = NextResponse.json({ user, token });
  res.cookies.set("spl-token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return res;
}

export async function DELETE(request: NextRequest) {
  const res = NextResponse.json({ ok: true });

  if (isSupabaseAuthEnabled()) {
    const supabase = createSupabaseRouteClient(request, res);
    if (supabase) await supabase.auth.signOut();
  }

  res.cookies.delete("spl-token");
  return res;
}
