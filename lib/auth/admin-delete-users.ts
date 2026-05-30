import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function adminDeleteUsers(ids: string[], currentAdminId: string) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) throw new Error("Chưa chọn người dùng nào");

  if (unique.includes(currentAdminId)) {
    throw new Error("Không thể xóa tài khoản admin đang đăng nhập");
  }

  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Cần SUPABASE_SERVICE_ROLE_KEY");

  const { data: targets, error: loadErr } = await client
    .from("users")
    .select("id, email, role")
    .in("id", unique);

  if (loadErr) throw new Error(loadErr.message);
  if (!targets?.length) throw new Error("Không tìm thấy người dùng");

  const { count: adminCount } = await client
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  const deletingAdmins = targets.filter((t) => t.role === "admin").length;
  if (adminCount !== null && adminCount - deletingAdmins < 1) {
    throw new Error("Phải giữ ít nhất một tài khoản quản trị");
  }

  for (const row of targets) {
    await client.from("drivers").delete().eq("user_id", row.id);
    const { error: userErr } = await client.from("users").delete().eq("id", row.id);
    if (userErr) throw new Error(`Xóa ${row.email}: ${userErr.message}`);

    try {
      await client.auth.admin.deleteUser(row.id);
    } catch {
      /* Auth có thể không tồn tại — bỏ qua */
    }
  }

  return { deleted: targets.length, emails: targets.map((t) => t.email as string) };
}
