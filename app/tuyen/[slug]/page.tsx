import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3, HelpCircle, MapPinned, Truck } from "lucide-react";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { LogisticsMap } from "@/components/logistics-map";
import { Navbar } from "@/components/navbar";
import { QuoteForm } from "@/components/quote-form";
import { popularRoutes } from "@/lib/data";
import { resolveRoutePage } from "@/lib/repositories/pricing.repository";
import { allProgrammaticRoutes, extraSeoRoutes } from "@/lib/seo-routes";
import { breadcrumbJsonLd, faqJsonLd, localBusinessJsonLd, serviceJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  const slugs = new Set([
    ...popularRoutes.map((r) => r.slug),
    ...allProgrammaticRoutes().map((r) => r.slug)
  ]);
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const route =
    (await resolveRoutePage(slug)) ??
    extraSeoRoutes.find((item) => item.slug === slug) ??
    allProgrammaticRoutes().find((item) => item.slug === slug) ??
    popularRoutes.find((item) => item.slug === slug);
  if (!route) return {};
  return {
    title: `${route.title} - Báo giá nhanh`,
    description: `${route.description} Giá tham khảo ${route.price}, thời gian ${route.time}, có theo dõi thời gian thực và chứng từ POD.`
  };
}

export default async function RoutePage({ params }: Props) {
  const { slug } = await params;
  const route =
    (await resolveRoutePage(slug)) ??
    extraSeoRoutes.find((item) => item.slug === slug) ??
    allProgrammaticRoutes().find((item) => item.slug === slug) ??
    popularRoutes.find((item) => item.slug === slug) ??
    popularRoutes[0];
  const faqs = [
    {
      question: `Giá vận chuyển từ ${route.from} đi ${route.to} là bao nhiêu?`,
      answer: `Giá phụ thuộc loại xe, tải trọng, lịch bốc xếp và thời điểm. Mức tham khảo hiện tại ${route.price}.`
    },
    {
      question: `Thời gian giao hàng từ ${route.from} đi ${route.to}?`,
      answer: `Thời gian vận chuyển thông thường là ${route.time}, có theo dõi GPS và ETA cập nhật thời gian thực.`
    },
    {
      question: "Nên chọn loại xe nào cho tuyến này?",
      answer: `Các lựa chọn phổ biến gồm ${route.vehicles.join(", ")} tùy theo kích thước và tính chất hàng.`
    }
  ];

  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <JsonLd
        data={localBusinessJsonLd({
          name: `Logistics Thông minh - ${route.from}`,
          description: route.description,
          areaServed: `${route.from}, ${route.to}, Vietnam`
        })}
      />
      <JsonLd
        data={serviceJsonLd({
          name: route.title,
          description: route.description
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Trang chu", url: "https://logistics-platform.example" },
          { name: "Tuyen duong", url: "https://logistics-platform.example/tuyen" },
          { name: route.title, url: `https://logistics-platform.example/tuyen/${route.slug}` }
        ])}
      />
      <Navbar />
      <main>
        <section className="bg-[#eef5fb] py-16">
          <div className="container grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#174ea6]">
                {route.from} {"->"} {route.to}
              </p>
              <h1 className="mt-4 max-w-4xl text-[clamp(2.3rem,5vw,4.6rem)] font-black leading-none tracking-normal text-[#0b1f3a]">
                {route.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{route.description}</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <MapPinned className="text-[#174ea6]" />
                  <p className="mt-4 text-sm font-bold text-slate-500">Giá từ</p>
                  <p className="text-2xl font-black text-[#0b1f3a]">{route.price}</p>
                </div>
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <Clock3 className="text-orange-600" />
                  <p className="mt-4 text-sm font-bold text-slate-500">Transit</p>
                  <p className="text-2xl font-black text-[#0b1f3a]">{route.time}</p>
                </div>
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <Truck className="text-green-700" />
                  <p className="mt-4 text-sm font-bold text-slate-500">Loại xe</p>
                  <p className="text-2xl font-black text-[#0b1f3a]">{route.vehicles.length}+</p>
                </div>
              </div>
            </div>
            <QuoteForm />
          </div>
        </section>

        <section className="section bg-white">
          <div className="container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <h2 className="section-title">Gợi ý xe cho tuyến này</h2>
              <div className="mt-6 grid gap-3">
                {route.vehicles.map((vehicle) => (
                  <div key={vehicle} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                    <span className="font-black text-[#0b1f3a]">{vehicle}</span>
                    <Link className="font-bold text-[#174ea6]" href="/#quote">
                      Báo giá <ArrowRight size={15} className="inline" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            <LogisticsMap />
          </div>
        </section>

        <section className="section bg-[#f8fafc]">
          <div className="container">
            <h2 className="section-title">Câu hỏi thường gặp</h2>
            <div className="mt-8 grid gap-4">
              {faqs.map((faq) => (
                <article key={faq.question} className="rounded-3xl border border-slate-200 bg-white p-6">
                  <h3 className="flex items-center gap-3 text-xl font-black text-[#0b1f3a]">
                    <HelpCircle className="text-orange-600" /> {faq.question}
                  </h3>
                  <p className="mt-3 text-slate-600">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
