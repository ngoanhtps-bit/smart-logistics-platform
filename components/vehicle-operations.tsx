import { Activity, Bot, CheckCircle2, MapPinned, Radar, Route, Truck } from "lucide-react";
import { containerFitRules, dispatchStatuses, laneOptimizer } from "@/lib/data";

export function VehicleOperations() {
  return (
    <section className="section bg-[#f7fafc]">
      <div className="container">
        <div className="mb-10 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-[#2563eb]">Thông tin điều phối</p>
            <h2 className="section-title mt-3">Điều phối như một nền tảng vận hành</h2>
          </div>
          <p className="text-lg leading-8 text-slate-600">
            Trang xe container kết nối trực tiếp với logic điều phối: kiểm tra hàng có vừa xe không,
            xe nào đang gần điểm lấy, tài xế nào đủ hồ sơ và có chuyến chiều về để tối ưu chi phí.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.12em] text-orange-600">Container fit engine</p>
                <h3 className="mt-2 text-3xl font-black text-[#102033]">Kiểm tra xe phù hợp</h3>
              </div>
              <span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-[#2563eb]">
                <Bot size={23} />
              </span>
            </div>
            <div className="grid gap-3">
              {containerFitRules.map((rule) => (
                <div key={rule.factor} className="grid gap-3 rounded-2xl border border-slate-100 bg-[#f8fbff] p-4 md:grid-cols-[0.55fr_1.1fr_0.45fr] md:items-center">
                  <p className="font-black text-[#102033]">{rule.factor}</p>
                  <p className="text-sm leading-6 text-slate-600">{rule.rule}</p>
                  <span className="rounded-full bg-white px-3 py-2 text-center text-xs font-black text-[#2563eb] shadow-sm">
                    {rule.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-3xl border border-slate-200 bg-[#102033] p-6 text-white shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <Route className="text-orange-300" />
                <h3 className="text-2xl font-black">Lane optimizer</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {laneOptimizer.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                    <p className="text-xs font-bold text-slate-300">{item.label}</p>
                    <p className="mt-2 text-2xl font-black">{item.value}</p>
                    <p className="mt-1 text-xs font-semibold text-orange-200">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <Activity className="text-green-600" />
                <h3 className="text-2xl font-black text-[#102033]">SLA live</h3>
              </div>
              <div className="grid gap-3">
                {["LCP landing < 2.5s", "GPS update 10-30 giây", "POD upload ngay khi giao", "Cảnh báo ETA lệch tuyến"].map((item) => (
                  <p key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <CheckCircle2 className="text-green-600" size={17} />
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.12em] text-[#2563eb]">Xe sẵn sàng</p>
              <h3 className="mt-2 text-3xl font-black text-[#102033]">Xe sẵn gần điểm lấy hàng</h3>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-black text-green-700">
              <Radar size={17} /> Trực tiếp
            </span>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {dispatchStatuses.map((vehicle) => (
              <article key={vehicle.code} className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-black text-[#102033]">{vehicle.code}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{vehicle.type}</p>
                  </div>
                  <Truck className="text-orange-600" />
                </div>
                <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <MapPinned size={16} /> {vehicle.location}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#2563eb]">{vehicle.status}</span>
                  <span className="text-sm font-black text-[#102033]">ETA {vehicle.eta}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
