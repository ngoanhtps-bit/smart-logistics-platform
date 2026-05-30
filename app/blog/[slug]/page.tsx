import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { Navbar } from "@/components/navbar";
import { QuoteForm } from "@/components/quote-form";
import { getBlogPost, listBlogPosts } from "@/lib/cms/blog";
import { getSiteUrl } from "@/lib/site-url";
import { breadcrumbJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await listBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const base = getSiteUrl();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Trang chủ", url: base },
          { name: "Blog", url: `${base}/blog` },
          { name: post.title, url: `${base}/blog/${post.slug}` }
        ])}
      />
      <Navbar />
      <main>
        <article className="section bg-white">
          <div className="container max-w-3xl">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-[#2563eb]">
              <ArrowLeft size={16} /> Quay lại blog
            </Link>
            <p className="mt-6 text-sm font-black uppercase tracking-[0.12em] text-orange-600">{post.category}</p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-[#102033] md:text-5xl">{post.title}</h1>
            <p className="mt-4 text-slate-500">
              {post.date} · {post.readTime}
            </p>
            <div className="prose prose-slate mt-10 max-w-none">
              <p className="text-lg leading-8 text-slate-700">{post.excerpt}</p>
              {post.content.split("\n").map((para, i) =>
                para.trim() ? (
                  <p key={i} className="mt-4 leading-8 text-slate-600">
                    {para}
                  </p>
                ) : null
              )}
            </div>
          </div>
        </article>
        <section className="section bg-[#eef5fb]">
          <div className="container max-w-lg">
            <QuoteForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
