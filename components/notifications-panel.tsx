"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { invalidateShipmentFlow } from "@/lib/query/invalidate-shipments";
import { notificationWorkspaceUrl, roleHomePath } from "@/lib/navigation/shipment-links";
import type { AppNotification } from "@/lib/notifications-store";
import { useAuthStore } from "@/store/auth";
import type { UserRole } from "@/types/logistics";

async function fetchNotifications(): Promise<AppNotification[]> {
  const res = await fetch("/api/notifications", { credentials: "include", cache: "no-store" });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role) as UserRole | undefined;
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 20_000
  });
  const unread = data?.filter((n) => !n.read).length ?? 0;

  const markRead = useMutation({
    mutationFn: async (id?: string) => {
      await fetch("/api/notifications", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { id } : { all: true })
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] })
  });

  function openNotification(n: AppNotification) {
    markRead.mutate(n.id);
    setOpen(false);
    if (n.shipmentCode) {
      invalidateShipmentFlow(qc, n.shipmentCode);
      router.push(
        notificationWorkspaceUrl(role, n.shipmentCode, { title: n.title })
      );
      return;
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="relative grid size-11 place-items-center rounded-2xl border border-slate-200 bg-white"
        aria-label="Thông báo"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={19} />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-orange-500 text-[10px] font-black text-white">
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-14 z-50 w-[min(380px,92vw)] rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-black text-[#102033]">Thông báo</h3>
              <button
                type="button"
                className="flex items-center gap-1 text-xs font-bold text-[#2563eb]"
                onClick={() => markRead.mutate(undefined)}
              >
                <Check size={14} /> Đọc tất cả
              </button>
            </div>
            <p className="mb-2 text-xs text-slate-500">
              Có mã đơn → mở đúng màn {role === "driver" ? "App tài xế" : role === "customer" ? "Khách hàng" : "Điều phối"}
            </p>
            <div className="grid max-h-80 gap-2 overflow-y-auto">
              {data?.length ? null : (
                <p className="py-4 text-center text-xs text-slate-400">Chưa có thông báo</p>
              )}
              {data?.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`rounded-2xl p-3 text-left transition hover:ring-2 hover:ring-blue-200 ${
                    n.read ? "bg-slate-50" : "bg-blue-50"
                  }`}
                  onClick={() => openNotification(n)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-black text-[#102033]">{n.title}</p>
                    {n.shipmentCode ? (
                      <span className="shrink-0 rounded-lg bg-[#102033] px-2 py-0.5 text-[10px] font-black text-white">
                        {n.shipmentCode}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{n.body}</p>
                  {n.shipmentCode ? (
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#2563eb]">
                      <ExternalLink size={12} /> Mở màn làm việc
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
            {role ? (
              <Link
                href={roleHomePath(role)}
                className="mt-3 block text-center text-xs font-bold text-slate-500 hover:text-[#2563eb]"
                onClick={() => setOpen(false)}
              >
                Về không gian {role} →
              </Link>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
