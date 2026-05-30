import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";
import { getSupabaseConfig } from "@/lib/supabase/config";

const protectedPaths = ["/customer", "/dispatcher", "/admin", "/driver", "/marketplace", "/account"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user } = await updateSupabaseSession(request);

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) return response;

  if (getSupabaseConfig().enabled) {
    if (!user) {
      const login = new URL("/login", request.url);
      login.searchParams.set("redirect", pathname);
      return NextResponse.redirect(login);
    }
    return response;
  }

  const demoToken = request.cookies.get("spl-token")?.value;
  if (!demoToken) {
    const login = new URL("/login", request.url);
    login.searchParams.set("redirect", pathname);
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
