import { vehicleCategories as staticVehicles } from "@/lib/data";
import { slugify } from "@/lib/cms/slug";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export type VehicleCategory = {
  id: string;
  slug: string;
  title: string;
  image: string;
  capacity: string;
  cargo: string;
  size: string;
  published: boolean;
  sortOrder: number;
};

type Row = {
  id: string;
  slug: string;
  title: string;
  image: string;
  capacity: string;
  cargo: string;
  size: string;
  published: boolean;
  sort_order: number;
};

async function dbClient() {
  return createSupabaseAdminClient() ?? (await createSupabaseServerClient());
}

function mapRow(r: Row): VehicleCategory {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    image: r.image,
    capacity: r.capacity,
    cargo: r.cargo,
    size: r.size,
    published: r.published,
    sortOrder: r.sort_order ?? 0
  };
}

function mapStatic(): VehicleCategory[] {
  return staticVehicles.map((v, i) => ({
    id: `static-${v.slug}`,
    slug: v.slug,
    title: v.title,
    image: v.image,
    capacity: v.capacity,
    cargo: v.cargo,
    size: v.size,
    published: true,
    sortOrder: i + 1
  }));
}

function sortList(list: VehicleCategory[]) {
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, "vi"));
}

export async function listVehicleCategories(admin = false): Promise<VehicleCategory[]> {
  if (!getSupabaseConfig().enabled) return mapStatic();

  const c = await dbClient();
  if (!c) return mapStatic();

  let q = c.from("vehicle_categories").select("*").order("sort_order").order("title");
  if (!admin) q = q.eq("published", true);

  const { data, error } = await q;
  if (error || !data?.length) return admin ? [] : mapStatic();

  return sortList((data as Row[]).map(mapRow));
}

export async function getVehicleCategory(slug: string, admin = false) {
  const list = await listVehicleCategories(admin);
  return list.find((v) => v.slug === slug) ?? null;
}

export async function upsertVehicleCategory(input: {
  id?: string;
  slug?: string;
  title: string;
  image: string;
  capacity: string;
  cargo: string;
  size: string;
  published?: boolean;
  sortOrder?: number;
}) {
  const c = await dbClient();
  if (!c) throw new Error("Không kết nối Supabase — chạy supabase/018_vehicle_categories_cms.sql");

  const slug = (input.slug?.trim() || slugify(input.title)).toLowerCase();
  const id = input.id ?? `vc-${Date.now()}`;

  const { data, error } = await c
    .from("vehicle_categories")
    .upsert(
      {
        id,
        slug,
        title: input.title.trim(),
        image: input.image.trim(),
        capacity: input.capacity.trim(),
        cargo: input.cargo.trim(),
        size: input.size.trim(),
        published: input.published ?? true,
        sort_order: input.sortOrder ?? 99,
        updated_at: new Date().toISOString()
      },
      { onConflict: "slug" }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as Row);
}

export async function deleteVehicleCategory(id: string) {
  const c = await dbClient();
  if (!c) throw new Error("Không kết nối Supabase");
  const { error } = await c.from("vehicle_categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
