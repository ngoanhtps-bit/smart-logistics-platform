import { Star } from "lucide-react";
import { customerReviews } from "@/lib/data";

export function CustomerReviews() {
  return (
    <section className="section bg-[#102033] text-white">
      <div className="container">
        <div className="mb-10 text-center">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-orange-300">Customer reviews</p>
          <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-black leading-tight md:text-5xl">
            Khách hàng đánh giá vận hành thời gian thực
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {customerReviews.map((review) => (
            <article
              key={review.company}
              className="rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur"
            >
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < review.rating ? "fill-orange-400 text-orange-400" : "text-slate-600"}
                  />
                ))}
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-300">&ldquo;{review.text}&rdquo;</p>
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="font-black">{review.name}</p>
                <p className="text-sm text-slate-400">
                  {review.role} · {review.company}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
