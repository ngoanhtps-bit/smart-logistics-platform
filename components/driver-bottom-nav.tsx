"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Bell, History, Navigation, User } from "lucide-react";

const items = [
  { href: "/driver?tab=pending", tab: "pending", label: "Chốt", icon: Bell },
  { href: "/driver?tab=active", tab: "active", label: "Chạy", icon: Navigation },
  { href: "/driver?tab=history", tab: "history", label: "Lịch sử", icon: History },
  { href: "/driver?tab=profile", tab: "profile", label: "Hồ sơ", icon: User }
] as const;

export function DriverBottomNav() {
  const tab = useSearchParams().get("tab") ?? "pending";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.08)] lg:hidden">
      <div className="mx-auto grid max-w-3xl grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = tab === item.tab;
          return (
            <Link
              key={item.tab}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-3 text-[10px] font-black ${
                active ? "text-orange-600" : "text-slate-500"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
