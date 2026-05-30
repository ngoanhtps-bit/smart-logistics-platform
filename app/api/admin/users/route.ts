import { NextResponse } from "next/server";

import { parseAccountStatus } from "@/lib/auth/account-status";

import { setUserAccountStatus } from "@/lib/auth/approve-user";

import { requireApiRoles } from "@/lib/auth/api-guard";

import { adminCreateUser } from "@/lib/auth/admin-create-user";
import { adminDeleteUsers } from "@/lib/auth/admin-delete-users";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

import { getSupabaseConfig } from "@/lib/supabase/config";

import type { AccountStatus, UserRole } from "@/types/logistics";



export async function GET() {

  const { error } = await requireApiRoles(["admin"]);

  if (error) return error;



  const client = createSupabaseAdminClient();

  if (!client) {

    return NextResponse.json({ message: "Cần SUPABASE_SERVICE_ROLE_KEY" }, { status: 503 });

  }



  const { data, error: dbError } = await client

    .from("users")

    .select("id, email, name, role, phone, account_status")

    .order("account_status")

    .order("role")

    .order("name");



  if (dbError) return NextResponse.json({ message: dbError.message }, { status: 500 });



  const users = (data ?? []).map((row) => ({

    id: row.id as string,

    email: row.email as string,

    name: row.name as string,

    role: row.role as UserRole,

    phone: (row.phone as string) ?? null,

    accountStatus: parseAccountStatus(row.account_status)

  }));



  return NextResponse.json({

    users,

    pendingCount: users.filter((u) => u.accountStatus === "pending").length

  });

}



export async function POST(request: Request) {

  const { error } = await requireApiRoles(["admin"]);

  if (error) return error;



  if (!getSupabaseConfig().enabled) {

    return NextResponse.json({ message: "Supabase chưa cấu hình" }, { status: 503 });

  }



  try {

    const body = await request.json();

    const role = body.role as UserRole;

    const newUser = await adminCreateUser({

      email: String(body.email ?? ""),

      password: String(body.password ?? ""),

      name: String(body.name ?? ""),

      role,

      phone: body.phone ? String(body.phone) : null,

      licenseNumber: body.licenseNumber ? String(body.licenseNumber) : null

    });



    const loginHint =

      role === "driver"

        ? "Đã tạo bản ghi drivers. Điều phối gán chuyến trên /dispatcher."

        : role === "dispatcher"

          ? "Đăng nhập tại /login → /dispatcher"

          : role === "admin"

            ? "Đăng nhập → /admin"

            : "Đăng nhập → /customer";



    return NextResponse.json(

      { user: newUser, message: `Đã tạo tài khoản ${newUser.email}. ${loginHint}` },

      { status: 201 }

    );

  } catch (e) {

    return NextResponse.json({ message: (e as Error).message }, { status: 400 });

  }

}



export async function PATCH(request: Request) {

  const { user: adminUser, error } = await requireApiRoles(["admin"]);

  if (error) return error;



  if (!getSupabaseConfig().enabled) {

    return NextResponse.json({ message: "Supabase chưa cấu hình" }, { status: 503 });

  }



  const body = await request.json();

  const userId = String(body.id ?? "");

  if (!userId) {

    return NextResponse.json({ message: "Thiếu id người dùng" }, { status: 400 });

  }



  const accountStatus = body.accountStatus as AccountStatus | undefined;

  if (accountStatus === "approved" || accountStatus === "rejected") {

    try {

      const user = await setUserAccountStatus(userId, accountStatus);

      const msg =

        accountStatus === "approved"

          ? `Đã duyệt ${user.email}. Người dùng có thể đăng nhập vào hệ thống.`

          : `Đã từ chối ${user.email}.`;

      return NextResponse.json({ user, message: msg });

    } catch (e) {

      return NextResponse.json({ message: (e as Error).message }, { status: 400 });

    }

  }



  const role = body.role as UserRole | undefined;

  const allowed: UserRole[] = ["customer", "dispatcher", "admin", "driver"];

  if (!role || !allowed.includes(role)) {

    return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });

  }



  if (userId === adminUser?.id && role !== "admin") {

    return NextResponse.json({ message: "Không thể hạ quyền chính mình" }, { status: 400 });

  }



  const client = createSupabaseAdminClient();

  if (!client) return NextResponse.json({ message: "Cần service role key" }, { status: 503 });



  const { data, error: dbError } = await client

    .from("users")

    .update({ role })

    .eq("id", userId)

    .select("id, email, name, role, phone, account_status")

    .single();



  if (dbError) return NextResponse.json({ message: dbError.message }, { status: 500 });



  const { data: authList } = await client.auth.admin.listUsers({ perPage: 1000 });

  const authUser = authList?.users?.find((u) => u.id === userId);

  if (authUser) {

    await client.auth.admin.updateUserById(userId, {

      user_metadata: {

        ...authUser.user_metadata,

        role,

        account_status: data.account_status

      }

    });

  }



  if (role === "driver" && data.account_status === "approved") {

    const driverId = `d-${userId.replace(/-/g, "").slice(0, 12)}`;

    await client.from("drivers").upsert(

      {

        id: driverId,

        user_id: userId,

        license_number: "GPLX-PENDING",

        current_location: "Chưa cập nhật",

        vehicle_id: null

      },

      { onConflict: "user_id" }

    );

  }



  return NextResponse.json({

    user: {

      id: data.id as string,

      email: data.email as string,

      name: data.name as string,

      role: data.role as UserRole,

      phone: (data.phone as string) ?? null,

      accountStatus: parseAccountStatus(data.account_status)

    }

  });

}

export async function DELETE(request: Request) {
  const { user: adminUser, error } = await requireApiRoles(["admin"]);
  if (error) return error;

  if (!getSupabaseConfig().enabled) {
    return NextResponse.json({ message: "Supabase chưa cấu hình" }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const ids = Array.isArray(body.ids) ? body.ids.map(String) : [];
  if (!ids.length) {
    return NextResponse.json({ message: "Thiếu danh sách id (ids)" }, { status: 400 });
  }

  try {
    const result = await adminDeleteUsers(ids, adminUser!.id);
    return NextResponse.json({
      ok: true,
      message: `Đã xóa ${result.deleted} tài khoản.`,
      ...result
    });
  } catch (e) {
    return NextResponse.json({ message: (e as Error).message }, { status: 400 });
  }
}

