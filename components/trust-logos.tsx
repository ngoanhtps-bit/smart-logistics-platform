const logos = [
  "Samsung",
  "LG",
  "Pantech",
  "Formosa",
  "Hòa Phát",
  "VinFast",
  "FPT",
  "THACO"
];

export function TrustLogos() {
  return (
    <section className="border-y border-slate-200 bg-white py-10">
      <div className="container">
        <p className="text-center text-xs font-black uppercase tracking-[0.16em] text-slate-400">
          Doanh nghiệp tin dùng nền tảng điều phối
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {logos.map((name) => (
            <span
              key={name}
              className="text-lg font-black tracking-tight text-slate-300 transition hover:text-slate-500"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
