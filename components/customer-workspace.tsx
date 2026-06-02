"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FileText, MapPinned, PackagePlus } from "lucide-react";
import { CustomerInvoices } from "@/components/customer-invoices";
import { CustomerNewOrder } from "@/components/customer-new-order";
import { CustomerOrdersList } from "@/components/customer-orders-list";
import { ShipmentJourneyPanel } from "@/components/shipment-journey-panel";
import { trackingUrl } from "@/lib/navigation/shipment-links";

type CustomerTab = "create" | "orders" | "invoices";

function CustomerWorkspaceInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as CustomerTab | null;
  const codeParam = searchParams.get("code");
  const [tab, setTab] = useState<CustomerTab>(tabParam === "create" || tabParam === "invoices" ? tabParam : "orders");
  const [selectedCode, setSelectedCode] = useState(codeParam ?? "");

  useEffect(() => {
    if (tabParam === "create" || tabParam === "orders" || tabParam === "invoices") setTab(tabParam);
  }, [tabParam]);

  useEffect(() => {
    if (codeParam) {
      setSelectedCode(codeParam);
      setTab("orders");
    }
  }, [codeParam]);

  const tabs: { id: CustomerTab; label: string; icon: typeof PackagePlus }[] = [
    { id: "create", label: "Tạo đơn", icon: PackagePlus },
    { id: "orders", label: "Đơn & hành trình", icon: MapPinned },
    { id: "invoices", label: "Hóa đơn", icon: FileText }
  ];

  return (
    <div className="grid gap-6">
      <div className="sticky top-0 z-10 rounded-2xl border border-emerald-200 bg-white/95 p-2 shadow-sm backdrop-blur">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black ${
                  tab === t.id ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "create" ? (
        <section className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-[#102033]">Tạo vận đơn mới</h2>
          <p className="mt-1 text-sm text-slate-600">
            Sau khi tạo, đơn vào tab «Đơn & hành trình» — điều phối gán xe và tài xế chốt (bạn theo dõi realtime).
          </p>
          <div className="mt-5">
            <CustomerNewOrder
              onCreated={(code) => {
                setSelectedCode(code);
                setTab("orders");
                router.replace(`/customer?tab=orders&code=${encodeURIComponent(code)}`);
              }}
            />
          </div>
        </section>
      ) : null}

      {tab === "orders" ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-[#102033]">Đơn hàng của bạn</h2>
            <p className="mt-1 text-sm text-slate-500">Bấm mã đơn để xem hành trình 6 bước bên phải.</p>
            <div className="mt-4">
              <CustomerOrdersList
                selectedCode={selectedCode}
                onSelectCode={setSelectedCode}
              />
            </div>
          </section>
          <section className="rounded-3xl border-2 border-emerald-200 bg-emerald-50/40 p-5 shadow-sm">
            <h3 className="font-black text-[#102033]">Hành trình đơn</h3>
            {selectedCode ? (
              <>
                <p className="mt-1 text-sm font-bold text-emerald-800">{selectedCode}</p>
                <div className="mt-4">
                  <ShipmentJourneyPanel code={selectedCode} />
                </div>
                <Link
                  href={trackingUrl(selectedCode)}
                  className="btn-primary mt-4 inline-flex w-full justify-center text-sm"
                >
                  Mở bản đồ GPS đầy đủ →
                </Link>
              </>
            ) : (
              <p className="mt-4 rounded-2xl bg-white p-6 text-center text-sm font-semibold text-slate-500">
                Chọn một đơn trong danh sách để xem tiến độ liên kết với điều phối & tài xế.
              </p>
            )}
          </section>
        </div>
      ) : null}

      {tab === "invoices" ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-[#102033]">Hóa đơn & chứng từ</h2>
          <CustomerInvoices />
        </section>
      ) : null}
    </div>
  );
}

export function CustomerWorkspace() {
  return (
    <Suspense fallback={<p className="font-bold text-slate-500">Đang tải không gian khách hàng…</p>}>
      <CustomerWorkspaceInner />
    </Suspense>
  );
}
