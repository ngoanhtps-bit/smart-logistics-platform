"use client";

import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { useState } from "react";
import { site } from "@/lib/data";

const links = [
  { href: "/#vehicles", label: "Loại xe" },
  { href: "/#routes", label: "Tuyến đường" },
  { href: "/bang-gia", label: "Bảng giá" },
  { href: "/blog", label: "Blog" },
  { href: "/tracking/SPL-260528-01", label: "Theo dõi" },
  { href: "/dispatcher", label: "Điều phối" },
  { href: "/customer", label: "Khách hàng" },
  { href: "/driver", label: "App tài xế" },
  { href: "/login", label: "Đăng nhập" }
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white lg:hidden"
        aria-label={open ? "Đóng menu" : "Mở menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open ? (
        <div className="fixed inset-0 top-[72px] z-40 bg-[#102033]/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden />
      ) : null}

      <nav
        className={`fixed right-0 top-[72px] z-50 h-[calc(100vh-72px)] w-[min(320px,88vw)] border-l border-slate-200 bg-white p-6 shadow-2xl transition-transform duration-200 lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="grid gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="mt-6 grid gap-3 border-t border-slate-100 pt-6">
          <a className="btn-ghost" href={`tel:${site.hotline.replace(/\s/g, "")}`}>
            <Phone size={17} />
            {site.hotline}
          </a>
          <Link className="btn-primary" href="/#quote" onClick={() => setOpen(false)}>
            Nhận báo giá
          </Link>
        </div>
      </nav>
    </>
  );
}
