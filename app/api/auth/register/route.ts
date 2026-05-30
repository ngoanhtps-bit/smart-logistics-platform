import { NextResponse, type NextRequest } from "next/server";
import {
  accountStatusForRegistration,
  PUBLIC_REGISTER_ROLES
} from "@/lib/auth/account-status";
import { upsertUserProfile, resolveAuthUser } from "@/lib/auth/profile";
import { createSupabaseRouteClientWithCookieJar } from "@/lib/supabase/route-handler";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { UserRole } from "@/types/logistics";

export async function POST(request: NextRequest) {
  if (!getSupabaseConfig().enabled) {
    return NextResponse.json(
      { message: "Chưa cấu hình Supabase. Thêm env NEXT_PUBLIC_SUPABASE_URL và publishable key." },
      { status: 503 }
    );
  }

  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim() || null;
  const requestedRole = body.role as UserRole | undefined;

  if (!email || !password || password.length < 6) {
    return NextResponse.json({ message: "Email và mật khẩu (tối thiểu 6 ký tự) là bắt buộc" }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ message: "Vui lòng nhập họ tên" }, { status: 400 });
  }

  const role: UserRole =
    requestedRole && PUBLIC_REGISTER_ROLES.includes(requestedRole) ? requestedRole : "customer";
  const accountStatus = accountStatusForRegistration(role);

  const { supabase, applyCookies } = createSupabaseRouteClientWithCookieJar(request);
  if (!supabase) {
    return NextResponse.json({ message: "Không kết nối được Supabase" }, { status: 500 });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role, phone, account_status: accountStatus }
    }
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (!data.user) {
    return NextResponse.json({ message: "Không tạo được tài khoản" }, { status: 500 });
  }

  const sync = await upsertUserProfile({
    id: data.user.id,
    email,
    name,
    role,
    phone,
    accountStatus
  });

  if (sync.error) {
    return NextResponse.json({ message: `Tài khoản Auth đã tạo nhưng lỗi profile: ${sync.error}` }, { status: 500 });
  }

  const user = await resolveAuthUser(data.user);
  const needsEmailConfirm = !data.session;

  const pendingMsg =
    role === "dispatcher"
      ? "Đăng ký điều phối thành công. Tài khoản đang chờ admin duyệt — bạn sẽ vào được hệ thống sau khi được phê duyệt."
      : role === "driver"
        ? "Đăng ký tài xế thành công. Tài khoản đang chờ admin duyệt — sau khi duyệt, điều phối sẽ gán chuyến cho bạn."
        : null;

  const response = NextResponse.json({
    user,
    needsEmailConfirm,
    pendingApproval: accountStatus === "pending",
    message: pendingMsg
      ?? (needsEmailConfirm
        ? "Đăng ký thành công. Kiểm tra email để xác nhận tài khoản (hoặc tắt xác nhận email trong Supabase Auth)."
        : "Đăng ký thành công")
  });
  if (data.session) applyCookies(response);
  return response;
}
