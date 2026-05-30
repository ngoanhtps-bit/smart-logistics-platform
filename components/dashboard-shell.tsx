import Link from "next/link";
import { Boxes, ChartNoAxesCombined, LayoutDashboard, MapPinned, Settings, Store, Truck, Users } from "lucide-react";
import { DashboardUserMenu } from "@/components/dashboard-user-menu";
import { NotificationsPanel } from "@/components/notifications-panel";

const nav = [
  { href: "/dispatcher", label: "Điều phối", icon: LayoutDashboard },
  { href: "/marketplace", label: "Sàn ghép chuyến", icon: Store },
  { href: "/customer", label: "Khách hàng", icon: Boxes },
  { href: "/driver", label: "App tài xế", icon: Truck },
  { href: "/admin", label: "Quản trị", icon: Settings }
];

export function DashboardShell({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-[#0f1f32] p-5 text-white lg:block">
        <Link href="/" className="text-xl font-black">Logistics Thông minh</Link>
        <nav className="mt-10 grid gap-2">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/10">
                <Icon size={18} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-10 rounded-3xl bg-white/10 p-4">
          <p className="text-sm font-black">Module thời gian thực</p>
          <div className="mt-4 grid gap-3 text-sm text-slate-300">
            <span className="flex items-center gap-2"><MapPinned size={15} /> Theo dõi GPS</span>
            <span className="flex items-center gap-2"><Truck size={15} /> Trạng thái xe</span>
            <span className="flex items-center gap-2"><Users size={15} /> App tài xế</span>
            <span className="flex items-center gap-2"><ChartNoAxesCombined size={15} /> Chỉ số KPI</span>
          </div>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/88 backdrop-blur-xl">
          <div className="flex h-[72px] items-center justify-between px-4 md:px-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#2563eb]">Trung tâm vận hành</p>
              <h1 className="text-2xl font-black text-[#0b1f3a]">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <NotificationsPanel />
              <DashboardUserMenu />
            </div>
          </div>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
