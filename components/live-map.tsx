"use client";

import { Navigation, RadioTower, Truck } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  shipmentCode?: string;
  speed?: number;
  updatedSec?: number;
};

export function LiveMap({ shipmentCode = "SPL-260528-01", speed = 62, updatedSec = 18 }: Props) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 20_000);
    return () => clearInterval(id);
  }, []);

  const offset = (tick % 4) * 2;
  const markers = [
    { left: `${18 + offset}%`, top: "30%", label: "HP" },
    { left: `${42 + offset * 0.5}%`, top: "48%", label: "DN" },
    { left: "71%", top: "67%", label: "HCM" }
  ];

  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="absolute inset-0 map-grid bg-[#f1f7ff]" />
      <div
        className="absolute left-[18%] top-[30%] h-[42%] w-[54%] rounded-full border-2 border-dashed border-[#2563eb]/35 transition-all duration-1000"
        style={{ transform: `rotate(${tick * 2}deg)` }}
      />
      {markers.map((marker) => (
        <div
          key={marker.label}
          className="absolute grid size-14 place-items-center rounded-2xl bg-[#102033] font-black text-white shadow-xl transition-all duration-1000"
          style={{ left: marker.left, top: marker.top }}
        >
          {marker.label}
        </div>
      ))}
      <div
        className="absolute grid size-16 place-items-center rounded-full bg-orange-500 text-white shadow-2xl ring-8 ring-orange-100 transition-all duration-1000"
        style={{ left: `${47 + offset * 0.3}%`, top: `${47 - offset * 0.2}%` }}
      >
        <Truck size={28} />
      </div>
      <div className="absolute bottom-5 left-5 right-5 grid gap-3 rounded-3xl bg-white/90 p-4 shadow-xl backdrop-blur md:grid-cols-3">
        <div className="flex items-center gap-3">
          <RadioTower className="text-[#2563eb]" />
          <div>
            <p className="text-sm font-black text-[#102033]">{shipmentCode}</p>
            <p className="text-xs font-semibold text-slate-500">Cập nhật {updatedSec} giây trước</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">Tốc độ GPS</p>
          <p className="font-black text-[#102033]">{speed} km/h</p>
        </div>
        <div className="flex items-center gap-2 font-black text-green-700">
          <Navigation size={18} /> Đúng lộ trình
        </div>
      </div>
    </div>
  );
}
