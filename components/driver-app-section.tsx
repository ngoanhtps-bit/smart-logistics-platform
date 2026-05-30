import { Camera, CheckCircle2, MessageSquareText, Navigation, Smartphone } from "lucide-react";
import { driverTasks } from "@/lib/data";

export function DriverAppSection() {
  return (
    <section className="section bg-white">
      <div className="container grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="mx-auto w-full max-w-[390px] rounded-[38px] border border-slate-200 bg-[#101828] p-3 shadow-2xl">
          <div className="rounded-[30px] bg-[#f8fbff] p-5">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#2563eb]">Driver app</p>
                <h3 className="mt-1 text-2xl font-black text-[#102033]">Chuyến hôm nay</h3>
              </div>
              <span className="grid size-11 place-items-center rounded-2xl bg-[#102033] text-white">
                <Smartphone size={20} />
              </span>
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-sm font-bold text-slate-500">SPL-260528-01</p>
              <p className="mt-2 text-xl font-black text-[#102033]">Hải Phòng {"->"} Bình Dương</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <span className="rounded-2xl bg-blue-50 p-3 text-xs font-black text-[#2563eb]">GPS ON</span>
                <span className="rounded-2xl bg-green-50 p-3 text-xs font-black text-green-700">POD</span>
                <span className="rounded-2xl bg-orange-50 p-3 text-xs font-black text-orange-700">ETA 18:30</span>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              {driverTasks.map((task) => (
                <div key={task.time} className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  <span className="text-sm font-black text-orange-600">{task.time}</span>
                  <div>
                    <p className="font-black text-[#102033]">{task.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{task.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[Navigation, Camera, MessageSquareText].map((Icon, index) => (
                <button key={index} className="grid h-12 place-items-center rounded-2xl bg-[#102033] text-white" type="button">
                  <Icon size={19} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-[0.14em] text-[#2563eb]">Mobile first operations</p>
          <h2 className="section-title mt-3">App tài xế là một phần của luồng thời gian thực</h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Tài xế nhận chuyến, bật GPS, cập nhật trạng thái, upload POD và chat với điều phối.
            Mỗi thao tác đẩy về dashboard và tracking page cho khách hàng.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {["Nhận chuyến và xác nhận lịch", "GPS cập nhật 10-30 giây", "Tải ảnh, chữ ký, chứng từ POD", "Chat điều phối và khách hàng"].map((item) => (
              <p key={item} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700">
                <CheckCircle2 className="text-green-600" size={18} /> {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
