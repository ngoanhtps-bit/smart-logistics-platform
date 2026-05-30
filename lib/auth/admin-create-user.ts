import { upsertUserProfile } from "@/lib/auth/profile";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types/logistics";

export type AdminCreateUserInput = {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  licenseNumber?: string | null;
};

function friendlyAuthError(message: string, email: string) {
  const m = message.toLowerCase();
  if (m.includes("database error creating new user")) {
    return (
      `Không tạo được user Auth (${email}). Thường do: (1) chưa chạy SQL supabase/016 và 017 trên Supabase, ` +
      `(2) email đã tồn tại — hệ thống sẽ thử đồng bộ lại. Chạy 017_fix_auth_user_trigger.sql rồi thử lại.`
    );
  }
  if (m.includes("already been registered") || m.includes("already exists")) {
    return `Email ${email} đã có trong Supabase Auth — dùng chức năng đổi role hoặc đăng nhập.`;
  }
  return message;
}

export async function adminCreateUser(input: AdminCreateUserInput) {
  const client = createSupabaseAdminClient();
  if (!client) {
    throw new Error("Cần SUPABASE_SERVICE_ROLE_KEY trên server (Vercel env)");
  }

  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const name = input.name.trim();

  if (!email || !password || password.length < 6) {
    throw new Error("Email và mật khẩu (tối thiểu 6 ký tự) là bắt buộc");
  }
  if (!name) throw new Error("Vui lòng nhập họ tên");

  const allowed: UserRole[] = ["customer", "dispatcher", "driver", "admin"];
  if (!allowed.includes(input.role)) {
    throw new Error("Vai trò không hợp lệ");
  }

  const meta = {
    name,
    role: input.role,
    phone: input.phone?.trim() || null,
    account_status: "approved"
  };

  let userId: string | null = null;

  const { data: byEmail, error: lookupErr } = await client.auth.admin.getUserByEmail(email);
  if (lookupErr && !lookupErr.message.toLowerCase().includes("not found")) {
    throw new Error(lookupErr.message);
  }
  if (byEmail?.user) {
    userId = byEmail.user.id;
  }

  if (!userId) {
    const { data: orphan } = await client.from("users").select("id").eq("email", email).maybeSingle();
    if (orphan?.id) {
      await client.from("users").delete().eq("email", email);
    }
  }

  if (userId) {
    const { error } = await client.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: { ...(byEmail?.user.user_metadata ?? {}), ...meta }
    });
    if (error) throw new Error(friendlyAuthError(error.message, email));
  } else {
    const { data, error } = await client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: meta
    });

    if (error) {
      const retry = await client.auth.admin.getUserByEmail(email);
      if (retry.data?.user) {
        userId = retry.data.user.id;
        await client.auth.admin.updateUserById(userId, {
          password,
          email_confirm: true,
          user_metadata: meta
        });
      } else {
        throw new Error(friendlyAuthError(error.message, email));
      }
    } else if (data.user) {
      userId = data.user.id;
    }
  }

  if (!userId) throw new Error("Không tạo được tài khoản Auth");

  const sync = await upsertUserProfile({
    id: userId,
    email,
    name,
    role: input.role,
    phone: input.phone?.trim() || null,
    accountStatus: "approved"
  });
  if (sync.error) throw new Error(`Auth OK nhưng lỗi profile: ${sync.error}`);

  if (input.role === "driver") {
    const driverId = `d-${userId.replace(/-/g, "").slice(0, 12)}`;
    const { error: driverError } = await client.from("drivers").upsert(
      {
        id: driverId,
        user_id: userId,
        license_number: input.licenseNumber?.trim() || "GPLX-PENDING",
        current_location: "Chưa cập nhật",
        vehicle_id: null
      },
      { onConflict: "user_id" }
    );
    if (driverError) {
      throw new Error(`Tài khoản đã tạo nhưng lỗi bảng drivers: ${driverError.message}`);
    }
  }

  return {
    id: userId,
    email,
    name,
    role: input.role,
    phone: input.phone?.trim() || null,
    accountStatus: "approved" as const
  };
}
