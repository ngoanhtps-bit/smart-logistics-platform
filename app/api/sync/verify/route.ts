import { NextResponse } from "next/server";
import { dispatcherRoles, requireApiRoles } from "@/lib/auth/api-guard";
import { buildSyncVerifySnapshot } from "@/lib/sync/verify";

/** Snapshot dùng chung — admin/điều phối kiểm tra đồng bộ 4 vai trò */
export async function GET() {
  const { error } = await requireApiRoles(dispatcherRoles);
  if (error) return error;

  const snapshot = await buildSyncVerifySnapshot();
  return NextResponse.json(snapshot);
}
