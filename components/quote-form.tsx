"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Loader2, MapPin, Package, Ruler, Sparkles, Truck } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { CreateOrderButton } from "@/components/create-order-button";
import { api } from "@/lib/api/client";
import { quoteSchema, type QuoteFormValues } from "@/lib/validators/quote";

const fields: { name: keyof QuoteFormValues; label: string; icon: typeof MapPin; placeholder: string; type?: string }[] = [
  { name: "pickup", label: "Điểm lấy hàng", icon: MapPin, placeholder: "Hải Phòng, Hà Nội..." },
  { name: "delivery", label: "Điểm giao hàng", icon: MapPin, placeholder: "Bình Dương, TP.HCM..." },
  { name: "cargoType", label: "Loại hàng", icon: Package, placeholder: "Pallet, thép, máy móc" },
  { name: "weight", label: "Trọng lượng", icon: Ruler, placeholder: "15 tấn" },
  { name: "dimensions", label: "Kích thước (tuỳ chọn)", icon: Ruler, placeholder: "Dài x Rộng x Cao" },
  { name: "vehicleType", label: "Loại xe", icon: Truck, placeholder: "Container 40FT" },
  { name: "shipDate", label: "Ngày vận chuyển", icon: CalendarDays, placeholder: "", type: "date" }
];

export function QuoteForm() {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors }
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      pickup: "",
      delivery: "",
      cargoType: "",
      weight: "",
      dimensions: "",
      vehicleType: "Container 40FT",
      shipDate: new Date().toISOString().slice(0, 10)
    }
  });

  const mutation = useMutation({
    mutationFn: (data: QuoteFormValues) => api.createQuote(data)
  });

  return (
    <form id="quote" className="shell rounded-3xl p-4 md:p-6" onSubmit={handleSubmit((d) => mutation.mutate(d))}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#2563eb]">Tìm kiếm thông minh</p>
          <h2 className="text-2xl font-black text-[#102033]">Nhận gợi ý xe phù hợp</h2>
        </div>
        <span className="hidden rounded-full bg-orange-50 px-3 py-2 text-sm font-bold text-orange-700 md:inline-flex">
          Gợi ý AI
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {fields.map((field) => {
          const Icon = field.icon;
          const err = errors[field.name];
          return (
            <label
              key={field.name}
              className={`rounded-xl border bg-white p-3 transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 ${
                err ? "border-red-300" : "border-slate-200"
              } ${field.name === "dimensions" ? "md:col-span-2" : ""}`}
            >
              <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                <Icon size={15} /> {field.label}
              </span>
              <input
                {...register(field.name)}
                type={field.type ?? "text"}
                className="w-full border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                placeholder={field.placeholder}
              />
              {err ? <p className="mt-1 text-xs font-bold text-red-600">{err.message}</p> : null}
            </label>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <p className="flex items-start gap-2 text-sm font-semibold text-[#1d4ed8]">
          <Sparkles className="mt-0.5 shrink-0" size={17} />
          Hệ thống gợi ý container, xe tải hoặc mooc rào dựa trên tải trọng, kích thước, tuyến và lịch xe trống.
        </p>
      </div>

      <button className="btn-primary mt-5 w-full" type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <>
            <Loader2 className="animate-spin" size={18} /> Đang tính giá...
          </>
        ) : (
          "Nhận báo giá ngay"
        )}
      </button>

      {mutation.isSuccess ? (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4">
          <p className="font-black text-green-800">{mutation.data.estimatedPrice}</p>
          <p className="mt-1 text-sm text-green-700">
            Xe đề xuất: <strong>{mutation.data.suggestedVehicle}</strong> · Thời gian: {mutation.data.transitDays} · Dự kiến giao: {mutation.data.eta}
          </p>
          <p className="mt-2 text-xs text-green-600">{mutation.data.message}</p>
          <p className="mt-2 text-xs font-bold text-slate-500">Mã báo giá: {mutation.data.id}</p>
          <CreateOrderButton getValues={getValues} />
        </div>
      ) : null}

      {mutation.isError ? (
        <p className="mt-3 text-sm font-bold text-red-600">{(mutation.error as Error).message}</p>
      ) : null}
    </form>
  );
}
