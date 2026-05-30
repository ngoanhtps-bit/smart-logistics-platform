import { CheckCircle2, Layers3 } from "lucide-react";
import { platformLayers, shipmentFlow } from "@/lib/data";

export function PlatformDepth() {
  return (
    <section className="section bg-white">
      <div className="container">
        <div className="mb-10 grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-[#2563eb]">Kiến trúc nền tảng</p>
            <h2 className="section-title mt-3">Không chỉ là website vận tải</h2>
          </div>
          <p className="text-lg leading-8 text-slate-600">
            Giao diện được thiết kế như một hệ vận hành logistics: khách tạo nhu cầu,
            điều phối ghép xe, tài xế cập nhật GPS/POD và quản trị theo dõi KPI.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {platformLayers.map((layer) => (
            <article key={layer.label} className="rounded-3xl border border-slate-200 bg-[#f8fbff] p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-[#102033] text-white">
                  <Layers3 size={20} />
                </span>
                <p className="text-sm font-black uppercase tracking-[0.1em] text-[#2563eb]">{layer.label}</p>
              </div>
              <h3 className="text-2xl font-black text-[#102033]">{layer.title}</h3>
              <div className="mt-5 grid gap-3">
                {layer.items.map((item) => (
                  <p key={item} className="flex items-start gap-2 text-sm font-semibold leading-6 text-slate-600">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-green-600" size={17} />
                    {item}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-5">
            {shipmentFlow.map((flow) => (
              <div key={flow.step} className="rounded-2xl bg-[#f6f8fb] p-5">
                <p className="text-sm font-black text-orange-600">{flow.step}</p>
                <h3 className="mt-3 text-lg font-black text-[#102033]">{flow.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{flow.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
