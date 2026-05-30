import { parseAccountStatus } from "@/lib/auth/account-status";
import { syncAuthUserRole } from "@/lib/auth/profile";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AccountStatus, UserRole } from "@/types/logistics";

async function ensureDriverRow(userId: string, licenseNumber?: string) {
  const client = createSupabaseAdminClient();
  if (!client) return;
  const driverId = `d-${userId.replace(/-/g, "").slice(0, 12)}`;
  await client.from("drivers").upsert(
    {
      id: driverId,
      user_id: userId,
      license_number: licenseNumber?.trim() || "GPLX-PENDING",
      current_location: "Chưa cập nhật",
      vehicle_id: null
    },
    { onConflict: "user_id" }
  );
}

export async function setUserAccountStatus(userId: string, status: AccountStatus) {
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Cần SUPABASE_SERVICE_ROLE_KEY");

  const { data: row, error } = await client
    .from("users")
    .update({ account_status: status })
    .eq("id", userId)
    .select("id, email, name, role, phone, account_status")
    .single();

  if (error) throw new Error(error.message);

  const role = row.role as UserRole;
  const { data: authList } = await client.auth.admin.listUsers({ perPage: 1000 });
  const authUser = authList?.users?.find((u) => u.id === userId);
  if (authUser) {
    await client.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...authUser.user_metadata,
        role,
        account_status: status
      }
    });
  } else {
    void syncAuthUserRole(userId, role, { account_status: status });
  }

  if (status === "approved" && role === "driver") {
    await ensureDriverRow(userId);
  }

  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    role,
    phone: (row.phone as string) ?? undefined,
    accountStatus: parseAccountStatus(row.account_status)
  };
}
