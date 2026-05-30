"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Boxes, CheckCircle2, Loader2, MoveRight, Sparkles, Truck } from "lucide-react";

type Load = {
  code: string;
  route: string;
  cargo: string;
  weight: string;
  price: string;
  match: string;
  vehicle: string;
};

export function MarketplaceSectionLive() {
  const { data: loads, isLoading } = useQuery({
    queryKey: ["marketplace", "home"],
    queryFn: () => fetch("/api/marketplace").then((r) => r.json() as Promise<Load[]>)
  });

  return (
    <section className="section bg-[#f7fafc]">
      <div className="container grid gap-8 xl:grid-cols-[0.92fr_1.08fr] xl:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-600">Sàn ghép chuyến</p>
          <h2 className="section-title mt-3">Ghép chuyến, giảm xe rỗng, tăng tỷ lệ nhận đơn</h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Đơn <strong>chờ gán xe</strong> từ cơ sở dữ liệu hiển thị trực tiếp — điều phối đấu giá và gán xe trên bảng điều khiển.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {["Gợi ý xe phù hợp", "Tối ưu chiều về", "So sánh ETA và giá", "Cảnh báo rủi ro SLA"].map((item) => (
              <p key={item} className="flex items-center gap-2 rounded-2xl bg-white p-4 text-sm font-bold text-slate-700 shadow-sm">
                <CheckCircle2 className="text-green-600" size={18} /> {item}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.12em] text-[#2563eb]">Bảng đơn trực tiếp</p>
              <h3 className="mt-1 text-3xl font-black text-[#102033]">Đơn chờ ghép xe</h3>
            </div>
            <span className="grid size-12 place-items-center rounded-2xl bg-orange-50 text-orange-600">
              <Sparkles size={22} />
            </span>
          </div>
          {isLoading ? (
            <div className="flex items-center gap-2 py-8 text-slate-500">
              <Loader2 className="animate-spin" size={18} /> Đang tải đơn...
            </div>
          ) : (
            <div className="grid gap-3">
              {(loads ?? []).slice(0, 3).map((load) => (
                <article key={load.code} className="rounded-3xl border border-slate-100 bg-[#f8fbff] p-5">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">{load.code}</p>
                      <h4 className="mt-2 text-xl font-black text-[#102033]">{load.route}</h4>
                      <p className="mt-2 text-sm font-semibold text-slate-600">
                        {load.cargo} · {load.weight}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <Boxes className="text-[#2563eb]" size={18} />
                      <span className="font-black text-[#102033]">{load.price}</span>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto] md:items-center">
                    <div className="rounded-2xl bg-white p-3">
                      <p className="text-xs font-bold text-slate-500">Xe đề xuất</p>
                      <p className="mt-1 font-black text-[#102033]">{load.vehicle}</p>
                    </div>
                    <MoveRight className="hidden text-slate-300 md:block" />
                    <div className="rounded-2xl bg-white p-3">
                      <p className="text-xs font-bold text-slate-500">Độ khớp</p>
                      <p className="mt-1 font-black text-green-700">{load.match}</p>
                    </div>
                    <Link className="btn-secondary md:w-auto" href="/marketplace">
                      <Truck size={17} /> Đấu giá
                    </Link>
                  </div>
                </article>
              ))}
              {(loads ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">Chưa có đơn chờ gán — tạo đơn tại trang Điều phối</p>
              ) : null}
            </div>
          )}
          <Link className="btn-ghost mt-5 w-full" href="/marketplace">
            Mở sàn ghép chuyến <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
