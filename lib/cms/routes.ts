import { popularRoutes } from "@/lib/data";
import { slugify } from "@/lib/cms/slug";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export type AdminRoute = {
  id: string;
  fromCity: string;
  toCity: string;
  slug: string;
  container20: string;
  container40: string;
  transitDays: string;
  metaTitle: string;
  metaDesc: string;
  title: string;
};

type Row = {
  id: string;
  from_city: string;
  to_city: string;
  slug: string;
  container_20: string | null;
  container_40: string | null;
  transit_days: string | null;
  meta_title: string | null;
  meta_desc: string | null;
};

async function client() {
  return createSupabaseAdminClient() ?? (await createSupabaseServerClient());
}

function mapRow(r: Row): AdminRoute {
  return {
    id: r.id,
    fromCity: r.from_city,
    toCity: r.to_city,
    slug: r.slug,
    container20: r.container_20 ?? "—",
    container40: r.container_40 ?? "—",
    transitDays: r.transit_days ?? "—",
    metaTitle: r.meta_title ?? `${r.from_city} → ${r.to_city}`,
    metaDesc: r.meta_desc ?? "",
    title: `${r.from_city} → ${r.to_city}`
  };
}

export async function listAdminRoutes(): Promise<AdminRoute[]> {
  if (!getSupabaseConfig().enabled) {
    return popularRoutes.map((r, i) => ({
      id: `static-${i}`,
      fromCity: r.from,
      toCity: r.to,
      slug: r.slug,
      container20: "—",
      container40: r.price.replace(/[^\d.]/g, "") ? `${r.price}` : "Liên hệ",
      transitDays: r.time,
      metaTitle: r.title,
      metaDesc: r.description,
      title: r.title
    }));
  }

  const c = await client();
  if (!c) return [];

  const { data, error } = await c.from("route_pricing").select("*").order("from_city");
  if (error || !data) return [];
  return (data as Row[]).map(mapRow);
}

export async function upsertRoute(input: {
  id?: string;
  fromCity: string;
  toCity: string;
  slug?: string;
  container20: string;
  container40: string;
  transitDays: string;
  metaTitle?: string;
  metaDesc?: string;
}) {
  const c = await client();
  if (!c) throw new Error("Không kết nối Supabase");

  const slug = input.slug?.trim() || slugify(`${input.fromCity}-${input.toCity}`);
  const id = input.id ?? `rp-${Date.now()}`;

  const { data, error } = await c
    .from("route_pricing")
    .upsert(
      {
        id,
        from_city: input.fromCity,
        to_city: input.toCity,
        slug,
        container_20: input.container20,
        container_40: input.container40,
        transit_days: input.transitDays,
        meta_title: input.metaTitle ?? `${input.fromCity} đi ${input.toCity}`,
        meta_desc: input.metaDesc ?? `Vận chuyển ${input.fromCity} ${input.toCity}`
      },
      { onConflict: "slug" }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as Row);
}

export async function updateRoutePricing(
  id: string,
  input: {
    container20: string;
    container40: string;
    transitDays: string;
    fromCity?: string;
    toCity?: string;
  }
) {
  const c = await client();
  if (!c) throw new Error("Không kết nối Supabase");

  const patch: Record<string, string> = {
    container_20: input.container20.trim(),
    container_40: input.container40.trim(),
    transit_days: input.transitDays.trim()
  };
  if (input.fromCity?.trim()) patch.from_city = input.fromCity.trim();
  if (input.toCity?.trim()) patch.to_city = input.toCity.trim();
  if (input.fromCity && input.toCity) {
    patch.meta_title = `${input.fromCity.trim()} đi ${input.toCity.trim()}`;
  }

  const { data, error } = await c.from("route_pricing").update(patch).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return mapRow(data as Row);
}

export async function deleteRoute(id: string) {
  const c = await client();
  if (!c) throw new Error("Không kết nối Supabase");
  const { error } = await c.from("route_pricing").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
