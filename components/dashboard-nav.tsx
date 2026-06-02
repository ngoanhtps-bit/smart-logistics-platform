"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, ChartNoAxesCombined, LayoutDashboard, MapPinned, Settings, Store, Truck, Users } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import type { UserRole } from "@/types/logistics";

const allNav: { href: string; label: string; icon: typeof LayoutDashboard; roles: UserRole[] }[] = [
  { href: "/dispatcher?tab=control", label: "Điều phối", icon: LayoutDashboard, roles: ["dispatcher", "admin"] },
  { href: "/driver?tab=pending", label: "App tài xế", icon: Truck, roles: ["driver", "admin"] },
  { href: "/customer?tab=orders", label: "Khách hàng", icon: Boxes, roles: ["customer", "admin"] },
  { href: "/marketplace", label: "Sàn ghép chuyến", icon: Store, roles: ["dispatcher", "admin", "customer"] },
  { href: "/admin", label: "Quản trị", icon: Settings, roles: ["admin"] }
];

export function DashboardNav() {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.user?.role);
  const items = role
    ? allNav.filter((n) => n.roles.includes(role) && (role !== "driver" || n.href.startsWith("/driver")))
    : allNav;
  const primary =
    role === "dispatcher"
      ? allNav.filter((n) => n.roles.includes("dispatcher"))
      : role === "customer"
        ? allNav.filter((n) => n.roles.includes("customer") && !n.href.includes("marketplace"))
        : role === "driver"
          ? allNav.filter((n) => n.href.startsWith("/driver"))
          : items;
  const showItems = role === "admin" ? items : primary.length ? primary : items;

  return (
    <nav className="mt-10 grid gap-2">
      {showItems.map((item) => {
        const Icon = item.icon;
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
              active ? "bg-white/20 text-white" : "text-slate-200 hover:bg-white/10"
            }`}
          >
            <Icon size={18} /> {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebarExtras() {
  return (
    <div className="mt-10 rounded-3xl bg-white/10 p-4">
      <p className="text-sm font-black">Module thời gian thực</p>
      <div className="mt-4 grid gap-3 text-sm text-slate-300">
        <span className="flex items-center gap-2">
          <MapPinned size={15} /> Theo dõi GPS
        </span>
        <span className="flex items-center gap-2">
          <Truck size={15} /> Trạng thái xe
        </span>
        <span className="flex items-center gap-2">
          <Users size={15} /> App tài xế
        </span>
        <span className="flex items-center gap-2">
          <ChartNoAxesCombined size={15} /> Chỉ số KPI
        </span>
      </div>
    </div>
  );
}
