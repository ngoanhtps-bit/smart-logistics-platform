import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function VehicleCard({
  vehicle
}: {
  vehicle: { slug: string; title: string; image: string; capacity: string; cargo: string; size: string };
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3]">
        <Image src={vehicle.image} alt={vehicle.title} fill className="object-cover" sizes="(min-width: 1024px) 33vw, 100vw" />
        <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-xs font-black text-[#102033]">
          Có xe sẵn
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-black text-[#102033]">{vehicle.title}</h3>
        <dl className="mt-4 grid gap-3 text-sm">
          <div>
            <dt className="font-bold text-slate-500">Tải trọng</dt>
            <dd className="font-semibold text-slate-900">{vehicle.capacity}</dd>
          </div>
          <div>
            <dt className="font-bold text-slate-500">Hàng phù hợp</dt>
            <dd className="font-semibold text-slate-900">{vehicle.cargo}</dd>
          </div>
        </dl>
        <Link className="mt-5 inline-flex items-center gap-2 font-black text-[#2563eb]" href={`/${vehicle.slug}`}>
          Xem báo giá <ArrowUpRight size={17} />
        </Link>
      </div>
    </article>
  );
}
