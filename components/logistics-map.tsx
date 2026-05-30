"use client";

import dynamic from "next/dynamic";

const MapLeaflet = dynamic(() => import("@/components/map-leaflet").then((m) => m.MapLeaflet), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-[#f1f7ff]">
      <p className="font-bold text-slate-500">Đang tải bản đồ...</p>
    </div>
  )
});

type Props = {
  shipmentCode?: string;
  speed?: number;
  updatedSec?: number;
};

export function LogisticsMap(props: Props) {
  return <MapLeaflet {...props} />;
}
