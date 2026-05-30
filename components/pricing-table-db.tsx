import Link from "next/link";
import { listPricingTable } from "@/lib/repositories/pricing.repository";

export async function PricingTableDb() {
  const rows = await listPricingTable();

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between bg-[#102033] px-4 py-3 text-sm font-black text-white">
        <span>Bảng giá tuyến</span>
        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-200">Cập nhật từ DB</span>
      </div>
      <div className="grid grid-cols-[1.2fr_1fr_1fr_0.8fr] bg-[#102033] px-4 py-3 text-sm font-black text-white md:grid">
        <span>Tuyến</span>
        <span>Container 20FT</span>
        <span>Container 40FT</span>
        <span>ETA</span>
      </div>
      {rows.map((row) => (
        <div
          key={row.route}
          className="grid grid-cols-1 gap-2 border-t border-slate-100 px-4 py-4 text-sm md:grid-cols-[1.2fr_1fr_1fr_0.8fr] md:gap-0"
        >
          {row.slug ? (
            <Link href={`/tuyen/${row.slug}`} className="font-bold text-[#102033] hover:text-[#2563eb]">
              {row.route}
            </Link>
          ) : (
            <span className="font-bold text-[#102033]">{row.route}</span>
          )}
          <span className="text-slate-600">{row.container20}</span>
          <span className="text-slate-600">{row.container40}</span>
          <span className="font-bold text-[#2563eb]">{row.eta}</span>
        </div>
      ))}
    </div>
  );
}
