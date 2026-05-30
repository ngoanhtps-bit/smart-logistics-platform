import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Truck } from "lucide-react";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { Navbar } from "@/components/navbar";
import { QuoteForm } from "@/components/quote-form";
import { industries } from "@/lib/industries";
import { faqJsonLd, serviceJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return industries.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = industries.find((i) => i.slug === slug);
  if (!item) return {};
  return { title: item.title, description: item.description };
}

export default async function IndustryPage({ params }: Props) {
  const { slug } = await params;
  const item = industries.find((i) => i.slug === slug) ?? industries[0];

  return (
    <>
      <JsonLd data={faqJsonLd(item.faqs)} />
      <JsonLd data={serviceJsonLd({ name: item.title, description: item.description })} />
      <Navbar />
      <main>
        <section className="bg-[#eef5fb] py-16">
          <div className="container grid gap-10 lg:grid-cols-[1fr_400px]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-600">Ngành hàng</p>
              <h1 className="mt-4 text-5xl font-black text-[#102033]">{item.title}</h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">{item.description}</p>
              <div className="mt-8 flex flex-wrap gap-2">
                {item.vehicles.map((v) => (
                  <span key={v} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
                    <Truck className="mr-1 inline" size={14} /> {v}
                  </span>
                ))}
              </div>
              <Link className="btn-primary mt-8 inline-flex" href="/bang-gia">
                Xem bảng giá <ArrowRight size={18} />
              </Link>
            </div>
            <QuoteForm />
          </div>
        </section>

        <section className="section bg-white">
          <div className="container max-w-3xl">
            <h2 className="section-title">Câu hỏi thường gặp</h2>
            <div className="mt-8 grid gap-4">
              {item.faqs.map((faq) => (
                <article key={faq.question} className="rounded-3xl border border-slate-200 p-6">
                  <h3 className="text-lg font-black text-[#102033]">{faq.question}</h3>
                  <p className="mt-2 text-slate-600">{faq.answer}</p>
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
