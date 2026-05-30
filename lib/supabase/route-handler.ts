import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/** Supabase client gắn cookie trực tiếp vào NextResponse (login API, v.v.). */
export function createSupabaseRouteClient(request: NextRequest, response: NextResponse) {
  const { url, key, enabled } = getSupabaseConfig();
  if (!enabled || !url || !key) return null;

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });
}

/** Thu cookie khi chưa biết URL redirect cuối (OAuth callback). */
export function createSupabaseRouteClientWithCookieJar(request: NextRequest) {
  const { url, key, enabled } = getSupabaseConfig();
  const jar: CookieToSet[] = [];
  if (!enabled || !url || !key) return { supabase: null as null, applyCookies: () => {} };

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        jar.push(...cookiesToSet);
      }
    }
  });

  return {
    supabase,
    applyCookies(target: NextResponse) {
      jar.forEach(({ name, value, options }) => {
        target.cookies.set(name, value, options);
      });
    }
  };
}

export function getRequestOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (forwardedHost && process.env.NODE_ENV === "production") {
    return `${proto}://${forwardedHost}`;
  }
  return new URL(request.url).origin;
}
