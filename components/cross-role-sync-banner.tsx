"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { roleLabelsVi } from "@/lib/vi-labels";

const roleLinks: Record<string, { href: string; label: string }> = {
  customer: { href: "/customer", label: "Khách hàng" },
  dispatcher: { href: "/dispatcher", label: "Điều phối" },
  driver: { href: "/driver", label: "Tài xế" },
  admin: { href: "/admin", label: "Admin" }
};

/** Gợi ý liên kết giữa các vai trò — dữ liệu đồng bộ qua Realtime + cache */
export function CrossRoleSyncBanner() {
  const role = useAuthStore((s) => s.user?.role);
  if (!role) return null;

  const others = (["customer", "dispatcher", "driver", "admin"] as const).filter((r) => r !== role);

  return (
    <div className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white px-4 py-3 text-sm">
      <p className="font-black text-[#102033]">
        Đồng bộ vai trò · Bạn đang là <span className="text-[#2563eb]">{roleLabelsVi[role]}</span>
      </p>
      <p className="mt-1 text-slate-600">
        Thay đổi từ Khách / Điều phối / Tài xế / Admin cập nhật chung trong ~15 giây (Realtime hoặc tự làm mới).
        Mở cùng mã đơn tại <strong>Theo dõi</strong> để thấy một kết quả.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {others.map((r) => (
          <Link
            key={r}
            href={roleLinks[r].href}
            className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-[#2563eb] shadow-sm ring-1 ring-slate-200 hover:bg-blue-50"
            target="_blank"
            rel="noopener noreferrer"
          >
            Kiểm tra {roleLinks[r].label} ↗
          </Link>
        ))}
        <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          Mở mã SPL trên /tracking/[mã]
        </span>
      </div>
    </div>
  );
}
