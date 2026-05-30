import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FileCheck2, MapPinned, RadioTower, ShieldCheck, Truck } from "lucide-react";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { Navbar } from "@/components/navbar";
import { QuoteForm } from "@/components/quote-form";
import { VehicleOperations } from "@/components/vehicle-operations";
import { cargoSegments, complianceDocs, pricingRows, shipmentFlow } from "@/lib/data";
import { getVehicleCategory, listVehicleCategories } from "@/lib/cms/vehicle-categories";
import { faqJsonLd } from "@/lib/seo";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ vehicle: string }> };

export async function generateStaticParams() {
  const vehicles = await listVehicleCategories();
  return vehicles.map((vehicle) => ({ vehicle: vehicle.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vehicle } = await params;
  const item = await getVehicleCategory(vehicle);
  if (!item) return {};
  return {
    title: `${item.title} - Tải trọng, kích thước, báo giá`,
    description: `${item.title} phù hợp ${item.cargo}. Tải trọng ${item.capacity}, ${item.size}. Nhận báo giá vận chuyển nhanh.`
  };
}

export default async function VehiclePage({ params }: Props) {
  const { vehicle } = await params;
  const item = await getVehicleCategory(vehicle);
  if (!item) notFound();
  const faqs = [
    {
      question: `${item.title} chở hàng gì?`,
      answer: `${item.title} phù hợp ${item.cargo}. Điều phối sẽ kiểm tra kích thước, tải trọng và điểm bốc xếp trước khi báo giá.`
    },
    {
      question: `Tải trọng ${item.title} là bao nhiêu?`,
      answer: `Tải trọng tham khảo ${item.capacity}. Tải trọng thực tế phụ thuộc dạng xe, quy định tuyến và hồ sơ phương tiện.`
    }
  ];

  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <Navbar />
      <main>
        <section className="bg-white py-16">
          <div className="container grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-600">Vehicle landing page</p>
              <h1 className="mt-4 text-[clamp(2.5rem,6vw,5rem)] font-black leading-none tracking-normal text-[#0b1f3a]">
                {item.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                {item.title} cho hàng Bắc Trung Nam, có đề xuất xe phù hợp, tracking GPS,
                POD và hồ sơ vận chuyển đầy đủ.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[item.capacity, item.size, item.cargo].map((value) => (
                  <div key={value} className="rounded-3xl border border-slate-200 bg-[#f8fafc] p-5">
                    <CheckCircle2 className="text-green-700" />
                    <p className="mt-3 text-sm font-bold text-slate-600">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="btn-primary" href="/#quote">
                  Nhận báo giá <ArrowRight size={18} />
                </Link>
                <Link className="btn-secondary" href="/tracking/SPL-260528-01">
                  Xem tracking mẫu
                </Link>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] shadow-2xl">
              <Image src={item.image} alt={item.title} fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
              <div className="absolute bottom-4 left-4 right-4 rounded-3xl bg-white/92 p-4 shadow-xl backdrop-blur">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs font-bold text-slate-500">GPS</p>
                    <p className="font-black text-[#102033]">10-30s</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500">POD</p>
                    <p className="font-black text-[#102033]">Online</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500">SLA</p>
                    <p className="font-black text-[#102033]">96.8%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section bg-[#f6f8fb]">
          <div className="container">
            <div className="mb-10 grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#2563eb]">Transport OS</p>
                <h2 className="section-title mt-3">Luồng vận hành {item.title}</h2>
              </div>
              <p className="text-lg leading-8 text-slate-600">
                Trang xe không chỉ để SEO. Nó dẫn khách từ nhu cầu vận chuyển sang quy trình báo giá,
                điều phối, tracking, POD và dashboard quản lý vận đơn.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-5">
              {shipmentFlow.map((flow) => (
                <article key={flow.step} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-black text-orange-600">{flow.step}</p>
                  <h3 className="mt-3 text-lg font-black text-[#102033]">{flow.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{flow.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <VehicleOperations />

        <section className="section bg-white">
          <div className="container grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-600">Route pricing</p>
              <h2 className="section-title mt-3">Bảng giá tuyến container tham khảo</h2>
              <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="grid grid-cols-[1.2fr_1fr_1fr_0.8fr] bg-[#102033] px-4 py-3 text-sm font-black text-white">
                  <span>Tuyến</span>
                  <span>20FT</span>
                  <span>40FT</span>
                  <span>ETA</span>
                </div>
                {pricingRows.map((row) => (
                  <div key={row.route} className="grid grid-cols-[1.2fr_1fr_1fr_0.8fr] border-t border-slate-100 px-4 py-4 text-sm">
                    <span className="font-bold text-[#102033]">{row.route}</span>
                    <span className="text-slate-600">{row.container20}</span>
                    <span className="text-slate-600">{row.container40}</span>
                    <span className="font-bold text-[#2563eb]">{row.eta}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                Giá thực tế thay đổi theo lịch bốc xếp, chiều hàng, phí nâng hạ, tải trọng,
                loại container và tình trạng xe trống theo thời điểm.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-3xl border border-slate-200 bg-[#f8fbff] p-6">
                <h3 className="flex items-center gap-3 text-2xl font-black text-[#102033]">
                  <Truck className="text-orange-600" /> Hàng phù hợp
                </h3>
                <div className="mt-5 flex flex-wrap gap-2">
                  {cargoSegments.map((segment) => (
                    <span key={segment} className="rounded-full border border-blue-100 bg-white px-3 py-2 text-sm font-bold text-slate-700">
                      {segment}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="flex items-center gap-3 text-2xl font-black text-[#102033]">
                  <FileCheck2 className="text-[#2563eb]" /> Chứng từ & POD
                </h3>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {complianceDocs.map((doc) => (
                    <p key={doc} className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                      <CheckCircle2 className="text-green-600" size={17} /> {doc}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section bg-[#102033] text-white">
          <div className="container">
            <div className="mb-8">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-300">Vận hành thời gian thực</p>
              <h2 className="mt-3 max-w-4xl text-4xl font-black leading-tight md:text-5xl">
                Từ trang SEO đến màn hình điều phối và app tài xế
              </h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {[
                { icon: MapPinned, title: "Bản đồ điều phối", text: "Theo dõi xe đang chạy, xe rỗng, đơn gần kho, trạng thái giao hàng và ETA." },
                { icon: RadioTower, title: "Sự kiện thời gian thực", text: "Tạo đơn, gán tài xế, cập nhật vị trí, giao hàng thành công." },
                { icon: ShieldCheck, title: "SLA & nhật ký", text: "Ghi nhận tiến trình, tài xế, cập nhật trạng thái, chứng từ POD và lịch sử thao tác." }
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className="rounded-3xl border border-white/10 bg-white/8 p-6">
                    <Icon className="text-orange-300" />
                    <h3 className="mt-5 text-2xl font-black">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{feature.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section bg-[#eef5fb]">
          <div className="container grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="section-title">Thông số và ứng dụng</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Trang này được thiết kế cho SEO theo loại xe, bảng giá, FAQ và CTA báo giá nhanh.
              </p>
            </div>
            <QuoteForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
