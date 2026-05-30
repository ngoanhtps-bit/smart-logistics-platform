import { popularRoutes, pricingRows } from "@/lib/data";
import {
  isSupabaseDataEnabled,
  supabaseFindRouteBySlug,
  supabaseListRoutePricing,
  type RoutePricingRow
} from "@/lib/supabase/data-access";

export type PricingTableRow = {
  route: string;
  container20: string;
  container40: string;
  eta: string;
  slug?: string;
};

export type PopularRouteCard = {
  slug: string;
  from: string;
  to: string;
  title: string;
  price: string;
  time: string;
  vehicles: string[];
  description: string;
};

function staticTableRows(): PricingTableRow[] {
  return pricingRows.map((r) => ({ ...r }));
}

function dbToPopularCard(row: RoutePricingRow): PopularRouteCard {
  const fallback = popularRoutes.find((p) => p.slug === row.slug);
  const price40 = row.container40.match(/[\d.]+/)?.[0];
  return {
    slug: row.slug,
    from: row.from,
    to: row.to,
    title: row.title,
    price: price40 ? `Từ ${price40} triệu` : fallback?.price ?? "Liên hệ",
    time: row.eta,
    vehicles: fallback?.vehicles ?? ["Container 40FT", "Mooc rào", "Xe tải 15T"],
    description: row.description
  };
}

export async function listPricingTable(): Promise<PricingTableRow[]> {
  if (isSupabaseDataEnabled()) {
    const rows = await supabaseListRoutePricing();
    if (rows.length > 0) {
      return rows.map((r) => ({
        route: r.route,
        container20: r.container20,
        container40: r.container40,
        eta: r.eta,
        slug: r.slug
      }));
    }
  }
  return staticTableRows();
}

export async function listPopularRoutesMerged(): Promise<PopularRouteCard[]> {
  if (isSupabaseDataEnabled()) {
    const dbRows = await supabaseListRoutePricing();
    if (dbRows.length > 0) {
      const fromDb = dbRows.map(dbToPopularCard);
      const dbSlugs = new Set(fromDb.map((r) => r.slug));
      const extra = popularRoutes
        .filter((p) => !dbSlugs.has(p.slug))
        .map((p) => ({ ...p }));
      return [...fromDb, ...extra];
    }
  }
  return popularRoutes.map((p) => ({ ...p }));
}

export async function resolveRoutePage(slug: string): Promise<PopularRouteCard | null> {
  if (isSupabaseDataEnabled()) {
    const db = await supabaseFindRouteBySlug(slug);
    if (db) return dbToPopularCard(db);
  }
  const found = popularRoutes.find((p) => p.slug === slug);
  return found ? { ...found } : null;
}
