import Link from "next/link";
import { Phone, Radar } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { NavbarAuth } from "@/components/navbar-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/lib/data";

const links = [
  { href: "/tim-kiem", label: "Tìm kiếm" },
  { href: "/#vehicles", label: "Loại xe" },
  { href: "/#routes", label: "Tuyến đường" },
  { href: "/bang-gia", label: "Bảng giá" },
  { href: "/blog", label: "Blog" },
  { href: "/tracking/SPL-260528-01", label: "Theo dõi" },
  { href: "/dispatcher", label: "Điều phối" }
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/92 backdrop-blur-xl">
      <div className="container flex h-[72px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 font-black text-[#0b1f3a]">
          <span className="grid size-10 place-items-center rounded-xl bg-[#102033] text-white shadow-sm">
            <Radar size={20} />
          </span>
          <span className="brand-type leading-tight">
            Logistics Thông minh
            <span className="block font-sans text-xs font-semibold text-slate-500">Vận tải thời gian thực</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[#174ea6]">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <NavbarAuth />
          <a className="btn-ghost" href={`tel:${site.hotline.replace(/\s/g, "")}`}>
            <Phone size={17} />
            {site.hotline}
          </a>
          <Link className="btn-primary" href="/#quote">
            Nhận báo giá
          </Link>
        </div>
        <MobileNav />
      </div>
    </header>
  );
}
