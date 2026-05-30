import { FileSearch, Network, ShieldCheck } from "lucide-react";
import { opsModules, seoClusters } from "@/lib/data";

export function SeoEngineSection() {
  return (
    <section className="section bg-[#102033] text-white">
      <div className="container">
        <div className="mb-10 grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-300">SEO & mở rộng quy mô</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-5xl">
              Kiến trúc sẵn cho SEO tự động theo tuyến và mở rộng sản phẩm
            </h2>
          </div>
          <p className="text-lg leading-8 text-slate-300">
            Nền tảng có thể sinh hàng nghìn trang tuyến đường, loại xe, ngành hàng và bảng giá,
            đồng thời giữ cùng dữ liệu vận hành với bảng điều phối.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-4">
          {seoClusters.map((cluster) => (
            <article key={cluster.title} className="rounded-3xl border border-white/10 bg-white/8 p-6">
              <FileSearch className="text-orange-300" />
              <p className="mt-5 text-3xl font-black">{cluster.count}</p>
              <h3 className="mt-2 text-xl font-black">{cluster.title}</h3>
              <div className="mt-4 grid gap-2 text-sm text-slate-300">
                {cluster.examples.map((example) => (
                  <span key={example}>{example}</span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-white/10 bg-white/8 p-6">
            <Network className="text-orange-300" />
            <h3 className="mt-5 text-2xl font-black">Modular backend roadmap</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Frontend hiện là scaffold data-driven. Bước backend sẽ nối NestJS, PostgreSQL,
              Redis, Socket.io và RBAC theo module.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {opsModules.map((module) => (
              <div key={module.name} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <p className="flex items-center gap-2 font-black">
                  <ShieldCheck className="text-green-300" size={18} /> {module.name}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{module.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
