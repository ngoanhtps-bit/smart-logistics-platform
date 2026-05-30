import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { TrackingLive } from "@/components/tracking-live";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Theo dõi vận đơn ${code}`,
    description: `Theo dõi GPS thời gian thực, ETA, tài xế, tiến trình và chứng từ POD cho vận đơn ${code}.`
  };
}

export default async function TrackingPage({ params }: Props) {
  const { code } = await params;

  return (
    <>
      <Navbar />
      <main>
        <section className="bg-[#eef5fb] py-14">
          <div className="container">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-[#174ea6]">Theo dõi trực tiếp</p>
            <h1 className="mt-4 text-[clamp(2.3rem,5vw,4.8rem)] font-black leading-none tracking-normal text-[#0b1f3a]">
              {code}
            </h1>
            <p className="mt-4 text-lg font-semibold text-slate-600">GPS cập nhật mỗi 20 giây · Đồng bộ thời gian thực</p>
          </div>
        </section>
        <TrackingLive code={code} />
      </main>
      <Footer />
    </>
  );
}
