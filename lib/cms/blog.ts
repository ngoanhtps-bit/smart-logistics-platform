import { blogPosts as staticPosts } from "@/lib/data";
import { slugify } from "@/lib/cms/slug";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  published: boolean;
  date: string;
};

type Row = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  read_time: string;
  published: boolean;
  created_at: string;
};

async function client() {
  return createSupabaseAdminClient() ?? (await createSupabaseServerClient());
}

function mapRow(r: Row): BlogPost {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    content: r.content,
    category: r.category,
    readTime: r.read_time,
    published: r.published,
    date: new Date(r.created_at).toLocaleDateString("vi-VN")
  };
}

function mapStatic(): BlogPost[] {
  return staticPosts.map((p, i) => ({
    id: `static-${i}`,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.excerpt,
    category: p.category,
    readTime: p.readTime,
    published: true,
    date: p.date
  }));
}

export async function listBlogPosts(admin = false): Promise<BlogPost[]> {
  if (!getSupabaseConfig().enabled) return mapStatic();

  const c = await client();
  if (!c) return mapStatic();

  let q = c.from("blog_posts").select("*").order("created_at", { ascending: false });
  if (!admin) q = q.eq("published", true);

  const { data, error } = await q;
  if (error || !data?.length) return admin ? [] : mapStatic();
  return (data as Row[]).map(mapRow);
}

export async function getBlogPost(slug: string, admin = false) {
  const posts = await listBlogPosts(admin);
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function upsertBlogPost(input: {
  slug?: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime?: string;
  published?: boolean;
  id?: string;
}) {
  const c = await client();
  if (!c) throw new Error("Không kết nối Supabase");

  const slug = input.slug?.trim() || slugify(input.title);
  const id = input.id ?? `bp-${Date.now()}`;

  const { data, error } = await c
    .from("blog_posts")
    .upsert(
      {
        id,
        slug,
        title: input.title,
        excerpt: input.excerpt,
        content: input.content,
        category: input.category,
        read_time: input.readTime ?? "5 phút",
        published: input.published ?? true,
        updated_at: new Date().toISOString()
      },
      { onConflict: "slug" }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as Row);
}

export async function deleteBlogPost(id: string) {
  const c = await client();
  if (!c) throw new Error("Không kết nối Supabase");
  const { error } = await c.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
