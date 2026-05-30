"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/config";

export function createSupabaseBrowserClient() {
  const { url, key, enabled } = getSupabaseConfig();
  if (!enabled || !url || !key) return null;
  return createBrowserClient(url, key);
}
