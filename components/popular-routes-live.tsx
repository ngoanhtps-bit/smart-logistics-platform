import Link from "next/link";
import { listPopularRoutesMerged } from "@/lib/repositories/pricing.repository";

export async function PopularRoutesLive() {
  const routes = await listPopularRoutesMerged();

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {routes.slice(0, 6).map((route) => (
        <Link
          key={route.slug}
          href={`/tuyen/${route.slug}`}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
        >
          <p className="text-sm font-black uppercase tracking-[0.1em] text-slate-500">
            {route.from} {"->"} {route.to}
          </p>
          <h3 className="mt-4 text-2xl font-black text-[#0b1f3a]">{route.title}</h3>
          <p className="mt-4 text-sm leading-6 text-slate-600">{route.description}</p>
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
            <span className="font-black text-orange-600">{route.price}</span>
            <span className="font-bold text-[#174ea6]">{route.time}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
