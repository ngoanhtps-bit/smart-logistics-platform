import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { site } from "@/lib/data";

export function Footer() {
  return (
    <footer className="bg-[#07172b] py-12 text-white">
      <div className="container grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="brand-type text-2xl font-black">{site.name}</p>
          <p className="mt-3 max-w-xl text-slate-300">
            Nền tảng vận tải container, xe tải và mooc rào Bắc Trung Nam với điều phối thời gian thực,
            bảng điều khiển chuyên nghiệp và trang SEO tự động theo tuyến.
          </p>
        </div>
        <div className="grid gap-3 text-sm text-slate-300">
          <Link href="/tuyen/ha-noi-sai-gon">Hà Nội đi Sài Gòn</Link>
          <Link href="/tuyen/hai-phong-binh-duong">Hải Phòng đi Bình Dương</Link>
          <Link href="/xe-mooc-rao">Xe mooc rào</Link>
          <Link href="/xe-container">Xe container</Link>
          <Link href="/bang-gia">Bảng giá</Link>
          <Link href="/nganh-hang/van-chuyen-thep">Vận chuyển thép</Link>
        </div>
        <div className="grid content-start gap-3 text-sm">
          <a className="flex items-center gap-2 text-slate-200" href={`tel:${site.hotline}`}>
            <Phone size={16} /> {site.hotline}
          </a>
          <a className="flex items-center gap-2 text-slate-200" href={`mailto:${site.email}`}>
            <Mail size={16} /> {site.email}
          </a>
          <Link className="btn-primary mt-2" href="/#quote">
            Báo giá nhanh
          </Link>
        </div>
      </div>
    </footer>
  );
}
