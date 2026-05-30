import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { VehicleCard } from "@/components/vehicle-card";
import { listVehicleCategories } from "@/lib/cms/vehicle-categories";

export async function VehicleCategoriesSection() {
  const vehicles = await listVehicleCategories(false);
  const firstSlug = vehicles[0]?.slug ?? "xe-container";

  return (
    <section id="vehicles" className="section bg-white">
      <div className="container">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-600">Danh mục loại xe</p>
            <h2 className="section-title mt-3">Tìm đúng xe cho từng loại hàng</h2>
          </div>
          <Link className="btn-ghost md:w-auto" href={`/${firstSlug}`}>
            Xem bảng giá xe <ArrowRight size={18} />
          </Link>
        </div>
        <div className="grid-auto">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.slug} vehicle={vehicle} />
          ))}
        </div>
      </div>
    </section>
  );
}
