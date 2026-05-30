import { NextResponse, type NextRequest } from "next/server";

import { accountStatusForRegistration, parseAccountStatus } from "@/lib/auth/account-status";
import { upsertUserProfile, resolveAuthUser } from "@/lib/auth/profile";
import { nameFromUserMetadata } from "@/lib/auth/metadata";

import {

  createSupabaseRouteClientWithCookieJar,

  getRequestOrigin

} from "@/lib/supabase/route-handler";

import type { UserRole } from "@/types/logistics";



export async function GET(request: NextRequest) {

  const { searchParams } = new URL(request.url);

  const origin = getRequestOrigin(request);

  const code = searchParams.get("code");

  const type = searchParams.get("type");

  const next = searchParams.get("next") ?? "/customer";



  if (searchParams.get("error")) {

    return NextResponse.redirect(`${origin}/login?error=auth_callback`);

  }



  if (!code) {

    return NextResponse.redirect(`${origin}/login?error=missing_code`);

  }



  const { supabase, applyCookies } = createSupabaseRouteClientWithCookieJar(request);

  if (!supabase) {

    return NextResponse.redirect(`${origin}/login?error=supabase`);

  }



  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {

    return NextResponse.redirect(`${origin}/login?error=auth_callback`);

  }



  const meta = data.user.user_metadata ?? {};

  const email = data.user.email ?? "";

  const oauthRole = ((meta.role as UserRole) ?? "customer") as UserRole;
  await upsertUserProfile({
    id: data.user.id,
    email,
    name: nameFromUserMetadata(meta, email),
    role: oauthRole,
    phone: (meta.phone as string) ?? null,
    accountStatus:
      parseAccountStatus(meta.account_status) === "approved"
        ? "approved"
        : accountStatusForRegistration(oauthRole)
  });



  if (type === "recovery") {

    const response = NextResponse.redirect(`${origin}/account?reset=1`);

    applyCookies(response);

    return response;

  }



  const user = await resolveAuthUser(data.user);

  const roleRedirects: Record<UserRole, string> = {

    customer: "/customer",

    dispatcher: "/dispatcher",

    admin: "/admin",

    driver: "/driver"

  };



  const dest =
    user.accountStatus === "pending" || user.accountStatus === "rejected"
      ? "/cho-duyet"
      : next.startsWith("/")
        ? next
        : roleRedirects[user.role] ?? "/customer";

  const response = NextResponse.redirect(`${origin}${dest}`);

  applyCookies(response);

  return response;

}

