/**
 * Seed data for programmatic SEO — expand via CMS or script generation.
 * generateStaticParams can import `allSeoRoutes` to scale to thousands of pages.
 */

export type SeoRoutePage = {
  slug: string;
  title: string;
  from: string;
  to: string;
  description: string;
  price: string;
  time: string;
  vehicles: string[];
};

const hubs = ["Hà Nội", "Hải Phòng", "Bắc Ninh", "Đà Nẵng", "TP.HCM", "Bình Dương", "Đồng Nai", "Cần Thơ"];

function slugify(from: string, to: string) {
  const map: Record<string, string> = {
    "Hà Nội": "ha-noi",
    "Hải Phòng": "hai-phong",
    "Bắc Ninh": "bac-ninh",
    "Đà Nẵng": "da-nang",
    "TP.HCM": "sai-gon",
    "Bình Dương": "binh-duong",
    "Đồng Nai": "dong-nai",
    "Cần Thơ": "can-tho"
  };
  return `${map[from] ?? "tu-a"}-${map[to] ?? "tu-b"}`;
}

/** Extra programmatic routes beyond `popularRoutes` in data.ts */
export const extraSeoRoutes: SeoRoutePage[] = [
  { from: "Đà Nẵng", to: "TP.HCM", slug: "da-nang-sai-gon", title: "Vận chuyển container Đà Nẵng đi Sài Gòn", description: "Tuyến Trung - Nam cho container và xe tải.", price: "Từ 10.5 triệu", time: "1-2 ngày", vehicles: ["Container 20FT", "Xe tải 15T"] },
  { from: "Hà Nội", to: "Đà Nẵng", slug: "ha-noi-da-nang", title: "Xe tải và container Hà Nội đi Đà Nẵng", description: "Tuyến Bắc - Trung cho hàng công nghiệp và pallet.", price: "Từ 8.2 triệu", time: "1-2 ngày", vehicles: ["Xe tải 15T", "Container 20FT"] },
  { from: "Cần Thơ", to: "Bình Dương", slug: "can-tho-binh-duong", title: "Vận chuyển hàng Cần Thơ đi Bình Dương", description: "Tuyến Nam - Đông cho hàng nông sản chế biến và hàng kho.", price: "Từ 7.8 triệu", time: "1 ngày", vehicles: ["Xe tải 5T", "Xe tải 15T"] }
];

/** All programmatic routes for SSG (deduped with popularRoutes in page) */
export function allProgrammaticRoutes(limit = 42): SeoRoutePage[] {
  const matrix = generateRouteMatrix(limit);
  const bySlug = new Map<string, SeoRoutePage>();
  for (const r of [...extraSeoRoutes, ...matrix]) {
    bySlug.set(r.slug, r);
  }
  return [...bySlug.values()];
}

/** Generator helper for batch SEO pages (CMS / build script) */
export function generateRouteMatrix(limit = 50): SeoRoutePage[] {
  const pages: SeoRoutePage[] = [];
  for (let i = 0; i < hubs.length; i++) {
    for (let j = 0; j < hubs.length; j++) {
      if (i === j) continue;
      const from = hubs[i];
      const to = hubs[j];
      pages.push({
        slug: slugify(from, to),
        from,
        to,
        title: `Vận chuyển container ${from} đi ${to}`,
        description: `Dịch vụ vận chuyển container, xe tải, mooc rào tuyến ${from} - ${to} với báo giá nhanh và tracking GPS.`,
        price: "Liên hệ báo giá",
        time: "1-4 ngày",
        vehicles: ["Container 40FT", "Mooc rào", "Xe tải 15T"]
      });
      if (pages.length >= limit) return pages;
    }
  }
  return pages;
}
