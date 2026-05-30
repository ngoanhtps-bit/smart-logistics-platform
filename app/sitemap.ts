import type { MetadataRoute } from "next";
import { blogPosts, popularRoutes } from "@/lib/data";
import { listVehicleCategories } from "@/lib/cms/vehicle-categories";
import { industries } from "@/lib/industries";
import { allProgrammaticRoutes } from "@/lib/seo-routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://logistics-app-blue.vercel.app";
  const vehicles = await listVehicleCategories();
  return [
    "",
    "/dispatcher",
    "/marketplace",
    "/customer",
    "/driver",
    "/admin",
    "/login",
    "/register",
    "/tracking/SPL-260528-01",
    "/bang-gia",
    "/tim-kiem",
    "/blog",
    ...industries.map((i) => `/nganh-hang/${i.slug}`),
    ...blogPosts.map((post) => `/blog/${post.slug}`),
    ...popularRoutes.map((route) => `/tuyen/${route.slug}`),
    ...allProgrammaticRoutes().map((route) => `/tuyen/${route.slug}`),
    ...vehicles.map((vehicle) => `/${vehicle.slug}`)
  ].map((url) => ({
    url: `${base}${url}`,
    lastModified: new Date("2026-05-28"),
    changeFrequency: "weekly",
    priority: url === "" ? 1 : 0.8
  }));
}
