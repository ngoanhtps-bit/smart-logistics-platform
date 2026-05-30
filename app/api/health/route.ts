import { NextResponse } from "next/server";
import { isDatabaseEnabled, prisma } from "@/lib/db";
import { getProductionReadiness } from "@/lib/production/readiness";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { supabaseListShipments } from "@/lib/supabase/data-access";

export async function GET() {
  const supabase = getSupabaseConfig();
  let prismaOk = false;
  let prismaError: string | null = null;
  let supabaseRows = 0;
  let supabaseError: string | null = null;

  if (isDatabaseEnabled()) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      prismaOk = true;
    } catch (e) {
      prismaError = e instanceof Error ? e.message : "Prisma connection failed";
    }
  }

  if (supabase.enabled) {
    try {
      const rows = await supabaseListShipments();
      supabaseRows = rows.length;
    } catch (e) {
      supabaseError = e instanceof Error ? e.message : "Supabase query failed — chạy 002_rls_policies.sql";
    }
  }

  const readiness = getProductionReadiness();

  let blogTable = false;
  if (supabase.enabled) {
    try {
      const admin = (await import("@/lib/supabase/admin")).createSupabaseAdminClient();
      if (admin) {
        const { error } = await admin.from("blog_posts").select("id").limit(1);
        blogTable = !error;
      }
    } catch {
      blogTable = false;
    }
  }

  return NextResponse.json({
    status: "ok",
    productionReady: readiness.ready && supabaseRows > 0 && !supabaseError,
    timestamp: new Date().toISOString(),
    readiness: {
      ready: readiness.ready,
      siteUrl: readiness.siteUrl
    },
    supabase: {
      configured: supabase.enabled,
      projectRef: supabase.projectRef,
      url: supabase.url ?? null,
      shipmentCount: supabaseRows,
      queryError: supabaseError
    },
    database: {
      prismaConfigured: isDatabaseEnabled(),
      prismaConnected: prismaOk,
      prismaError
    },
    cms: {
      blogTable,
      hint: blogTable ? null : "Chạy supabase/014_cms_blog.sql"
    },
    authHint:
      "Đăng nhập cần user trong Supabase Auth — chạy: npm run seed:auth-demo (admin@demo.vn / demo1234)"
  });
}
