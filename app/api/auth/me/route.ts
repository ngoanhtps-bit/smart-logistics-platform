import { NextResponse } from "next/server";
import { resolveAuthUser, isSupabaseAuthEnabled } from "@/lib/auth/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  if (!isSupabaseAuthEnabled()) {
    return NextResponse.json({ user: null });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ user: null });

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return NextResponse.json({ user: null });

  const user = await resolveAuthUser(authUser);
  return NextResponse.json({ user });
}
