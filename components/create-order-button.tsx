"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth";
import type { QuoteFormValues } from "@/lib/validators/quote";

export function CreateOrderButton({ getValues }: { getValues: () => QuoteFormValues }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const orderMut = useMutation({
    mutationFn: () => api.createShipment(getValues())
  });

  return (
    <div className="mt-3">
      <button
        className="btn-secondary w-full text-sm"
        type="button"
        disabled={orderMut.isPending}
        onClick={() => orderMut.mutate()}
      >
        {orderMut.isPending ? <Loader2 className="animate-spin" size={16} /> : "Tạo đơn vận chuyển"}
      </button>

      {orderMut.isSuccess ? (
        <div className="mt-3 rounded-xl bg-white/80 p-3 text-sm">
          <p className="font-black text-green-800">Mã vận đơn: {(orderMut.data as { code: string }).code}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              className="font-bold text-[#2563eb] hover:underline"
              href={`/tracking/${(orderMut.data as { code: string }).code}`}
            >
              Theo dõi ngay →
            </Link>
            {user?.role === "customer" ? (
              <button
                type="button"
                className="font-bold text-slate-600 hover:underline"
                onClick={() => router.push("/customer")}
              >
                Bảng khách hàng
              </button>
            ) : !user ? (
              <Link className="font-bold text-slate-600 hover:underline" href="/login?redirect=/customer">
                Đăng nhập để quản lý đơn
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      {orderMut.isError ? (
        <p className="mt-2 text-xs font-bold text-red-600">{(orderMut.error as Error).message}</p>
      ) : null}
    </div>
  );
}
