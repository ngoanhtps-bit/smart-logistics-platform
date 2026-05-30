import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  if (!getSupabaseConfig().enabled) {
    return NextResponse.json({ message: "Chưa bật Supabase Auth" }, { status: 503 });
  }

  const session = await getSessionUser();
  if (!session) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

  const body = await request.json();
  const name = body.name != null ? String(body.name).trim() : undefined;
  const phone = body.phone != null ? String(body.phone).trim() : undefined;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ message: "Lỗi kết nối" }, { status: 500 });

  const updates: { name?: string; phone?: string } = {};
  if (name) updates.name = name;
  if (phone !== undefined) updates.phone = phone;

  const { error: authError } = await supabase.auth.updateUser({
    data: { ...updates, role: session.role }
  });
  if (authError) {
    return NextResponse.json({ message: authError.message }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const db = admin ?? supabase;
  const { error: dbError } = await db
    .from("users")
    .update({
      ...(name ? { name } : {}),
      ...(phone !== undefined ? { phone: phone || null } : {})
    })
    .eq("id", session.id);

  if (dbError) {
    return NextResponse.json({ message: dbError.message }, { status: 500 });
  }

  return NextResponse.json({
    user: { ...session, ...updates, phone: phone ?? session.phone }
  });
}
