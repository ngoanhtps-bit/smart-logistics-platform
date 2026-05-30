"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check } from "lucide-react";
import { useState } from "react";

type Notification = {
  id: string;
  title: string;
  body: string;
  type: "info" | "warning" | "success";
  read: boolean;
  createdAt: string;
};

async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch("/api/notifications");
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["notifications"], queryFn: fetchNotifications, refetchInterval: 60_000 });
  const unread = data?.filter((n) => !n.read).length ?? 0;

  const markRead = useMutation({
    mutationFn: async (id?: string) => {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { id } : { all: true })
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] })
  });

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
          <div className="absolute right-0 top-14 z-50 w-[min(360px,92vw)] rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
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
            <div className="grid max-h-80 gap-2 overflow-y-auto">
              {data?.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`rounded-2xl p-3 text-left ${n.read ? "bg-slate-50" : "bg-blue-50"}`}
                  onClick={() => markRead.mutate(n.id)}
                >
                  <p className="text-sm font-black text-[#102033]">{n.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{n.body}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
