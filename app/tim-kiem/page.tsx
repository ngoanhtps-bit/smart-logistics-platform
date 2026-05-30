"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { industries } from "@/lib/industries";
import { vehicleCategories as staticVehicles, popularRoutes } from "@/lib/data";

type VehicleHit = { slug: string; title: string; cargo: string };

type ShipmentHit = { code: string; route: string; status: string; cargo: string };

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [shipments, setShipments] = useState<ShipmentHit[]>([]);
  const [vehicleCategories, setVehicleCategories] = useState<VehicleHit[]>(
    staticVehicles.map((v) => ({ slug: v.slug, title: v.title, cargo: v.cargo }))
  );

  useEffect(() => {
    fetch("/api/vehicle-categories")
      .then((r) => r.json())
      .then((list: VehicleHit[]) => {
        if (Array.isArray(list) && list.length) setVehicleCategories(list);
      })
      .catch(() => {});
  }, []);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return { routes: [], vehicles: [], industries: [] };

    const routes = popularRoutes.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        r.from.toLowerCase().includes(query) ||
        r.to.toLowerCase().includes(query)
    );
    const vehicles = vehicleCategories.filter(
      (v) => v.title.toLowerCase().includes(query) || v.cargo.toLowerCase().includes(query)
    );
    const industryHits = industries.filter(
      (i) => i.title.toLowerCase().includes(query) || i.description.toLowerCase().includes(query)
    );
    return { routes, vehicles, industries: industryHits };
  }, [q]);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      setShipments([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data: { shipments: ShipmentHit[] }) => setShipments(data.shipments ?? []))
        .catch(() => setShipments([]));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#eef5fb] dark:bg-[#0b1220]">
        <section className="container py-14">
          <h1 className="text-4xl font-black text-[#102033] dark:text-white">Tìm kiếm</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Tuyến, loại xe, mã vận đơn (SPL-...), địa điểm</p>
          <input
            className="mt-6 w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-lg font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            placeholder="VD: SPL-260528, Hải Phòng, container..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
          />

          {shipments.length > 0 ? (
            <div className="mt-8">
              <h2 className="font-black text-[#102033] dark:text-white">Vận đơn</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {shipments.map((s) => (
                  <Link
                    key={s.code}
                    href={`/tracking/${s.code}`}
                    className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900"
                  >
                    <p className="font-black text-[#2563eb]">{s.code}</p>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{s.route}</p>
                    <p className="text-xs text-slate-500">
                      {s.cargo} · {s.status}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            <div>
              <h2 className="font-black text-[#102033] dark:text-white">Tuyến đường</h2>
              <div className="mt-3 grid gap-2">
                {results.routes.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/tuyen/${r.slug}`}
                    className="rounded-xl bg-white p-4 text-sm font-bold shadow-sm dark:bg-slate-900 dark:text-slate-200"
                  >
                    {r.from} → {r.to}
                  </Link>
                ))}
                {q && results.routes.length === 0 ? <p className="text-sm text-slate-500">Không có kết quả</p> : null}
              </div>
            </div>
            <div>
              <h2 className="font-black text-[#102033] dark:text-white">Loại xe</h2>
              <div className="mt-3 grid gap-2">
                {results.vehicles.map((v) => (
                  <Link
                    key={v.slug}
                    href={`/${v.slug}`}
                    className="rounded-xl bg-white p-4 text-sm font-bold shadow-sm dark:bg-slate-900 dark:text-slate-200"
                  >
                    {v.title}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-black text-[#102033] dark:text-white">Ngành hàng</h2>
              <div className="mt-3 grid gap-2">
                {results.industries.map((i) => (
                  <Link
                    key={i.slug}
                    href={`/nganh-hang/${i.slug}`}
                    className="rounded-xl bg-white p-4 text-sm font-bold shadow-sm dark:bg-slate-900 dark:text-slate-200"
                  >
                    {i.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
