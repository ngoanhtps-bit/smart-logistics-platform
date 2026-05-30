import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { Footer } from "@/components/footer";
import { DriverAppSection } from "@/components/driver-app-section";
import { Hero } from "@/components/hero";
import { JsonLd } from "@/components/json-ld";
import { LogisticsMap } from "@/components/logistics-map";
import { MarketplaceSectionLive } from "@/components/marketplace-section-live";
import { PopularRoutesLive } from "@/components/popular-routes-live";
import { Navbar } from "@/components/navbar";
import { PlatformDepth } from "@/components/platform-depth";
import { SeoEngineSection } from "@/components/seo-engine-section";
import { CustomerReviews } from "@/components/customer-reviews";
import { TrustLogos } from "@/components/trust-logos";
import { VehicleCategoriesSection } from "@/components/vehicle-categories-section";
import { benefits } from "@/lib/data";
import { organizationJsonLd } from "@/lib/seo";

export default function Home() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <Navbar />
      <main>
        <Hero />
        <TrustLogos />
        <PlatformDepth />
        <MarketplaceSectionLive />

        <VehicleCategoriesSection />

        <section id="routes" className="section bg-[#f8fafc]">
          <div className="container">
            <div className="mb-10">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#2563eb]">Tuyến phổ biến</p>
              <h2 className="section-title mt-3">Tuyến Bắc Trung Nam có báo giá nhanh</h2>
            </div>
            <PopularRoutesLive />
          </div>
        </section>

        <section className="section bg-white">
          <div className="container grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-600">Theo dõi trực tiếp</p>
              <h2 className="section-title mt-3">Bản đồ điều phối thời gian thực cho từng vận đơn</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Điều phối viên theo dõi xe đang chạy, xe rỗng, đơn gần kho, ETA, trạng thái giao hàng
                và cảnh báo chậm tiến độ trên cùng một màn hình.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link className="btn-primary" href="/tracking/SPL-260528-01">
                  Xem theo dõi mẫu
                </Link>
                <Link className="btn-secondary" href="/dispatcher">
                  Mở bảng điều phối
                </Link>
              </div>
            </div>
            <LogisticsMap />
          </div>
        </section>

        <DriverAppSection />

        <section className="section bg-[#eef5fb]">
          <div className="container">
            <div className="mb-10">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#2563eb]">Vì sao chọn chúng tôi</p>
              <h2 className="section-title mt-3">Vận hành như nền tảng logistics hiện đại</h2>
            </div>
            <div className="grid-auto">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <article key={benefit.title} className="rounded-3xl border border-white bg-white p-6 shadow-sm">
                    <Icon className="text-orange-600" size={28} />
                    <h3 className="mt-5 text-xl font-black text-[#0b1f3a]">{benefit.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{benefit.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <SeoEngineSection />

        <CustomerReviews />

        <section className="section bg-white">
          <div className="container rounded-[32px] bg-[#0b1f3a] p-8 text-white md:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-300">Liên hệ ngay</p>
                <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-5xl">
                  Cần báo giá container, xe tải hoặc mooc rào trong ngày?
                </h2>
                <p className="mt-4 max-w-2xl text-slate-300">
                  Gửi thông tin tuyến, hàng và lịch vận chuyển. Điều phối sẽ đề xuất xe, giá và ETA phù hợp.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <a className="btn-primary" href="tel:0901668888">
                  <Phone size={18} /> Gọi hotline
                </a>
                <a className="btn-ghost" href="#quote">
                  <MessageCircle size={18} /> Gửi yêu cầu
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <div className="fixed bottom-4 right-4 z-50 grid gap-2">
        <a className="grid size-[52px] place-items-center rounded-full bg-orange-500 text-white shadow-xl" href="tel:0901668888" aria-label="Gọi hotline">
          <Phone size={22} />
        </a>
        <a className="grid size-[52px] place-items-center rounded-full bg-[#2563eb] text-white shadow-xl" href="#quote" aria-label="Báo giá nhanh">
          <MessageCircle size={22} />
        </a>
      </div>
      <Footer />
    </>
  );
}
