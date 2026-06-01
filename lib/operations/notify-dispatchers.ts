import { createAppNotification } from "@/lib/notifications/app-notifications";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/** Báo điều phối/admin khi có đơn mới — liên kết thẳng tới gán xe */
export async function notifyDispatchersNewOrder(code: string, route: string) {
  const client = createSupabaseAdminClient();
  if (!client) return;

  const { data: users } = await client.from("users").select("id").in("role", ["dispatcher", "admin"]);
  for (const u of users ?? []) {
    await createAppNotification({
      userId: u.id as string,
      title: `Đơn mới ${code}`,
      body: `${route} — vào Điều phối để gán xe hoặc gửi tài xế chốt.`,
      type: "info",
      shipmentCode: code
    });
  }
}
