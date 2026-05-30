import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { listBlogPosts } from "@/lib/cms/blog";

export const metadata: Metadata = {
  title: "Blog logistics & vận tải Bắc Trung Nam",
  description:
    "Kiến thức vận chuyển container, xe tải, mooc rào, tracking GPS và điều phối logistics cho doanh nghiệp."
};

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await listBlogPosts();

  return (
    <>
      <Navbar />
      <main>
        <section className="bg-[#eef5fb] py-16">
          <div className="container">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-[#2563eb]">SEO Blog</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black text-[#102033]">Blog logistics & vận tải</h1>
          </div>
        </section>
        <section className="section bg-white">
          <div className="container grid gap-5 md:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-3xl border border-slate-200 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-[#2563eb]">{post.category}</span>
                <h2 className="mt-4 text-xl font-black text-[#102033] group-hover:text-[#2563eb]">{post.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{post.excerpt}</p>
                <div className="mt-6 flex items-center justify-between text-sm font-bold text-slate-500">
                  <span>{post.date}</span>
                  <span className="flex items-center gap-1">
                    <Clock3 size={14} /> {post.readTime}
                  </span>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 font-black text-orange-600">
                  Đọc tiếp <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
