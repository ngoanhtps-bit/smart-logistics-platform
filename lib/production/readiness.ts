import { getSupabaseConfig } from "@/lib/supabase/config";
import { isDatabaseEnabled } from "@/lib/db";
import { getSiteUrl } from "@/lib/site-url";

export type ReadinessCheck = {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
};

export function getProductionReadiness(): {
  ready: boolean;
  checks: ReadinessCheck[];
  siteUrl: string;
} {
  const supabase = getSupabaseConfig();
  const checks: ReadinessCheck[] = [];

  checks.push({
    id: "app_url",
    label: "NEXT_PUBLIC_APP_URL",
    ok: Boolean(process.env.NEXT_PUBLIC_APP_URL?.trim()),
    detail: process.env.NEXT_PUBLIC_APP_URL?.trim() || "Chưa set — dùng URL Vercel mặc định"
  });

  checks.push({
    id: "supabase_url",
    label: "Supabase URL",
    ok: supabase.enabled && Boolean(supabase.url),
    detail: supabase.enabled ? (supabase.url ?? "") : "Thiếu NEXT_PUBLIC_SUPABASE_URL"
  });

  checks.push({
    id: "supabase_key",
    label: "Supabase publishable key",
    ok: supabase.enabled && Boolean(supabase.key),
    detail: supabase.enabled ? "Đã cấu hình" : "Thiếu NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  });

  checks.push({
    id: "service_role",
    label: "SUPABASE_SERVICE_ROLE_KEY (server)",
    ok: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
    detail: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "Đã cấu hình — admin users & đồng bộ profile"
      : "Khuyến nghị cho production (tab Người dùng admin)"
  });

  checks.push({
    id: "prisma_db",
    label: "DATABASE_URL (Prisma — tuỳ chọn)",
    ok: isDatabaseEnabled(),
    detail: isDatabaseEnabled() ? "Đã cấu hình" : "Không bắt buộc nếu dùng Supabase client"
  });

  const siteUrl = getSiteUrl();
  const isHttps = siteUrl.startsWith("https://");
  checks.push({
    id: "https",
    label: "HTTPS production URL",
    ok: process.env.NODE_ENV !== "production" || isHttps,
    detail: siteUrl
  });

  const critical = ["supabase_url", "supabase_key", "app_url"];
  const ready = critical.every((id) => checks.find((c) => c.id === id)?.ok);

  return { ready, checks, siteUrl };
}
