import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { Navbar } from "@/components/navbar";
import { PricingTableDb } from "@/components/pricing-table-db";
import { QuoteForm } from "@/components/quote-form";
import { listVehicleCategories } from "@/lib/cms/vehicle-categories";
import { faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Bảng giá vận chuyển container & xe tải Bắc Nam",
  description: "Bảng giá tham khảo container 20FT/40FT, xe tải, mooc rào các tuyến Bắc Trung Nam. Báo giá chính xác trong 12 phút."
};

const faqs = [
  {
    question: "Giá container Bắc Nam thay đổi theo yếu tố nào?",
    answer: "Phụ thuộc loại container, tải trọng, phí nâng hạ, lịch bốc xếp, thời điểm và tình trạng xe trống."
  },
  {
    question: "Bảng giá trên web có phải giá chốt không?",
    answer: "Đây là mức tham khảo. Giá chính thức do điều phối xác nhận sau khi nhận đủ thông tin tuyến và hàng."
  }
];

export default async function PricingPage() {
  const vehicleCategories = await listVehicleCategories();
  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <Navbar />
      <main>
        <section className="bg-[#102033] py-16 text-white">
          <div className="container">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-300">Bảng giá</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight">Giá vận chuyển container & xe tải</h1>
            <p className="mt-5 max-w-2xl text-slate-300">
              Tham khảo giá các tuyến Bắc Trung Nam. Nhận báo giá chính xác qua form hoặc hotline.
            </p>
          </div>
        </section>

        <section className="section bg-white">
          <div className="container">
            <PricingTableDb />
          </div>
        </section>

        <section className="section bg-[#f8fafc]">
          <div className="container">
            <h2 className="section-title">Giá theo loại xe</h2>
            <div className="mt-8 grid-auto">
              {vehicleCategories.map((v) => (
                <Link
                  key={v.slug}
                  href={`/${v.slug}`}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <h3 className="text-xl font-black text-[#102033]">{v.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{v.capacity} · {v.cargo}</p>
                  <span className="mt-4 inline-block font-bold text-orange-600">Xem chi tiết →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section bg-white">
          <div className="container grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="section-title">FAQ bảng giá</h2>
              <div className="mt-6 grid gap-4">
                {faqs.map((f) => (
                  <article key={f.question} className="rounded-2xl border border-slate-200 p-5">
                    <h3 className="font-black text-[#102033]">{f.question}</h3>
                    <p className="mt-2 text-sm text-slate-600">{f.answer}</p>
                  </article>
                ))}
              </div>
            </div>
            <QuoteForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
