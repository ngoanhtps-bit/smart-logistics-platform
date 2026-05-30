"use client";

import Link from "next/link";
import { MapPinned, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useShipments } from "@/hooks/use-shipments";
import { CustomerOrdersList } from "@/components/customer-orders-list";
import { CustomerInvoices } from "@/components/customer-invoices";
import { CustomerNewOrder } from "@/components/customer-new-order";
import { DashboardKpisLive } from "@/components/dashboard-kpis-live";

const savedAddresses = [
  { label: "Kho chính", address: "KCN Bình Dương, Thuận An" },
  { label: "Nhà máy", address: "KCN Yên Phong, Bắc Ninh" },
  { label: "Cảng", address: "Cảng Hải Phòng, Đình Vũ" }
];

function CustomerStatsSummary({ shipmentCount }: { shipmentCount: number }) {
  const { data } = useQuery({
    queryKey: ["analytics", "mine"],
    queryFn: () => fetch("/api/analytics?scope=mine").then((r) => r.json())
  });
  const delivered = data?.summary?.delivered ?? 0;
  const onTime = data?.summary?.onTimeRate ?? 0;

  return (
    <section className="rounded-3xl border border-slate-200 bg-[#102033] p-6 text-white">
      <div className="flex items-center gap-2">
        <Star className="text-orange-400" fill="currentColor" />
        <h2 className="text-lg font-black">Thống kê của bạn</h2>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-sm text-slate-400">Tổng vận đơn</p>
          <p className="text-2xl font-black">{shipmentCount}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Đã giao</p>
          <p className="text-2xl font-black">{delivered}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Đúng SLA (ước tính)</p>
          <p className="text-2xl font-black">{onTime > 0 ? `${onTime.toFixed(1)}%` : "—"}</p>
        </div>
      </div>
    </section>
  );
}

export function CustomerDashboard() {
  const { data: shipments } = useShipments({ mine: true });

  return (
    <div className="grid gap-6">
      <CustomerNewOrder />
      <div className="grid gap-4 md:grid-cols-4">
        <DashboardKpisLive scope="mine" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black text-[#102033]">Đơn hàng của bạn</h2>
            <Link className="btn-primary text-sm md:w-auto" href="/#quote">
              Báo giá nhanh
            </Link>
          </div>
          <CustomerOrdersList />
        </section>

        <div className="grid gap-4">
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg font-black text-[#102033]">
              <MapPinned size={20} className="text-[#2563eb]" /> Địa chỉ đã lưu
            </h2>
            <div className="mt-4 grid gap-3">
              {savedAddresses.map((addr) => (
                <div key={addr.label} className="rounded-2xl bg-[#f8fafc] p-4">
                  <p className="font-black text-[#102033]">{addr.label}</p>
                  <p className="mt-1 text-sm text-slate-600">{addr.address}</p>
                </div>
              ))}
            </div>
          </section>
          <CustomerInvoices />
        </div>
      </div>

      <CustomerStatsSummary shipmentCount={shipments?.length ?? 0} />
    </div>
  );
}
