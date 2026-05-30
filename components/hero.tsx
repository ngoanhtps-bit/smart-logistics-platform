import Link from "next/link";
import { ArrowRight, CircleDollarSign, MapPinned, RadioTower } from "lucide-react";
import { QuoteForm } from "@/components/quote-form";
import { trustStats } from "@/lib/data";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_56%,#ffffff_100%)]">
      <div className="absolute inset-0 map-grid opacity-55" />
      <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-200/28 blur-3xl" />
      <div className="container relative grid min-h-[calc(100vh-72px)] items-center gap-10 py-12 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-[#2563eb] shadow-sm">
            <RadioTower size={16} /> Điều phối vận tải thời gian thực Bắc Trung Nam
          </div>
          <h1 className="max-w-4xl text-[clamp(2.35rem,6vw,5.25rem)] font-black leading-[1.03] tracking-normal text-[#102033]">
            Vận chuyển Container, Xe tải, Mooc rào toàn quốc
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Nền tảng logistics giúp báo giá nhanh, tìm xe phù hợp, theo dõi GPS thời gian thực,
            quản lý chứng từ giao hàng (POD) và vận hành bảng điều phối chuyên nghiệp.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="btn-primary" href="#quote">
              Nhận báo giá ngay <ArrowRight size={18} />
            </Link>
            <Link className="btn-secondary" href="#vehicles">
              Tìm xe phù hợp
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            {trustStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white bg-white/82 p-4 shadow-sm backdrop-blur">
                <p className="text-2xl font-black text-[#102033]">{stat.value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <QuoteForm />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="shell rounded-3xl p-5">
              <MapPinned className="text-[#174ea6]" />
              <p className="mt-4 text-3xl font-black text-[#102033]">96.8%</p>
              <p className="text-sm font-semibold text-slate-500">đơn giao đúng SLA</p>
            </div>
            <div className="shell rounded-3xl p-5">
              <CircleDollarSign className="text-orange-600" />
              <p className="mt-4 text-3xl font-black text-[#102033]">12 phút</p>
              <p className="text-sm font-semibold text-slate-500">thời gian báo giá TB</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
