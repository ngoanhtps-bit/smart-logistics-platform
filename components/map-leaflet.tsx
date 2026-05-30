"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { defaultRoute, interpolateRoute, type GeoPoint } from "@/lib/geo";

const truckIcon = L.divIcon({
  className: "",
  html: `<div style="width:40px;height:40px;border-radius:50%;background:#f97316;border:4px solid #fff;box-shadow:0 8px 24px rgba(0,0,0,.25);display:grid;place-items:center;font-size:18px">🚛</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

const hubIcon = (label: string) =>
  L.divIcon({
    className: "",
    html: `<div style="padding:6px 10px;border-radius:10px;background:#102033;color:#fff;font-weight:800;font-size:12px;box-shadow:0 4px 12px rgba(0,0,0,.2)">${label}</div>`,
    iconAnchor: [20, 10]
  });

type Props = {
  shipmentCode?: string;
  speed?: number;
  updatedSec?: number;
  route?: GeoPoint[];
};

export function MapLeaflet({
  shipmentCode = "SPL-260528-01",
  speed = 62,
  updatedSec = 18,
  route = defaultRoute
}: Props) {
  const [progress, setProgress] = useState(0.55);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => (p >= 0.98 ? 0.12 : p + 0.008));
    }, 20_000);
    return () => clearInterval(id);
  }, []);

  const vehiclePos = useMemo(() => interpolateRoute(route, progress), [route, progress]);
  const center: [number, number] = [vehiclePos.lat, vehiclePos.lng];
  const line: [number, number][] = route.map((p) => [p.lat, p.lng]);

  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
      <MapContainer center={center} zoom={6} className="h-[420px] w-full" scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={line} pathOptions={{ color: "#2563eb", weight: 4, dashArray: "8 8" }} />
        {route.map((hub) => (
          <Marker key={hub.label} position={[hub.lat, hub.lng]} icon={hubIcon(hub.label)}>
            <Popup>{hub.label}</Popup>
          </Marker>
        ))}
        <Marker position={[vehiclePos.lat, vehiclePos.lng]} icon={truckIcon}>
          <Popup>{shipmentCode}</Popup>
        </Marker>
      </MapContainer>
      <div className="pointer-events-none absolute bottom-5 left-5 right-5 grid gap-3 rounded-3xl bg-white/92 p-4 shadow-xl backdrop-blur md:grid-cols-3">
        <div>
          <p className="text-sm font-black text-[#102033]">{shipmentCode}</p>
          <p className="text-xs font-semibold text-slate-500">Cập nhật {updatedSec}s · OpenStreetMap</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">Tốc độ</p>
          <p className="font-black text-[#102033]">{speed} km/h</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">Tiến độ tuyến</p>
          <p className="font-black text-green-700">{Math.round(progress * 100)}%</p>
        </div>
      </div>
    </div>
  );
}
