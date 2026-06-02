"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import {
  customerOrderUrl,
  dispatcherAssignUrl,
  dispatcherControlUrl,
  driverAppUrl,
  driverTripUrl,
  roleHomePath
} from "@/lib/navigation/shipment-links";
import { roleLabelsVi } from "@/lib/vi-labels";
import type { UserRole } from "@/types/logistics";

export function TrackingRolePanel({ code, offerStatus }: { code: string; offerStatus?: string }) {
  const role = useAuthStore((s) => s.user?.role);

  if (!role) {
    return (
      <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
        <p className="font-bold text-slate-700">Đăng nhập để mở đúng màn hình vai trò (Khách / Điều phối / Tài xế).</p>
        <Link href={`/login?redirect=${encodeURIComponent(`/tracking/${code}`)}`} className="btn-primary mt-3 inline-flex text-sm">
          Đăng nhập
        </Link>
      </div>
    );
  }

  const workspace = workspaceLink(role, code, offerStatus);

  return (
    <div className="mb-6 rounded-2xl border-2 border-[#2563eb]/20 bg-gradient-to-r from-blue-50 to-white p-4">
      <p className="text-xs font-black uppercase text-[#2563eb]">
        Bạn đang là {roleLabelsVi[role as UserRole] ?? role}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-700">{workspace.hint}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={workspace.primary} className="inline-flex items-center gap-1 rounded-xl bg-[#102033] px-4 py-2 text-sm font-black text-white">
          {workspace.primaryLabel}
          <ArrowRight size={14} />
        </Link>
        <Link
          href={roleHomePath(role as UserRole)}
          className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-600 ring-1 ring-slate-200"
        >
          Về {roleLabelsVi[role as UserRole]}
        </Link>
      </div>
    </div>
  );
}

function workspaceLink(role: string, code: string, offerStatus?: string) {
  if (role === "driver") {
    const pending = offerStatus === "pending";
    return {
      hint: pending ? "Chốt chuyến này trên app tài xế." : "Cập nhật trạng thái & GPS trên app.",
      primary: pending ? driverAppUrl(code, "pending") : driverTripUrl(code),
      primaryLabel: pending ? "Mở App chốt chuyến" : "Mở chi tiết chuyến"
    };
  }
  if (role === "dispatcher" || role === "admin") {
    const pending = offerStatus === "pending";
    return {
      hint: pending ? "Đơn đang chờ tài xế chốt — xem tab Gán & chốt." : "Điều khiển trạng thái & nhật ký.",
      primary: pending ? dispatcherAssignUrl(code) : dispatcherControlUrl(code),
      primaryLabel: pending ? "Điều phối — chờ chốt" : "Điều phối — điều khiển"
    };
  }
  if (role === "customer") {
    return {
      hint: "Xem hành trình 6 bước trong không gian Khách hàng.",
      primary: customerOrderUrl(code),
      primaryLabel: "Khách — đơn & hành trình"
    };
  }
  return {
    hint: "Theo dõi GPS trên trang này.",
    primary: `/tracking/${code}`,
    primaryLabel: "Theo dõi"
  };
}
