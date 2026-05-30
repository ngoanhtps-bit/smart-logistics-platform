import { NextResponse } from "next/server";
import { requireApiRoles } from "@/lib/auth/api-guard";
import { deleteBlogPost, listBlogPosts, upsertBlogPost } from "@/lib/cms/blog";

export async function GET() {
  const { error } = await requireApiRoles(["admin"]);
  if (error) return error;
  return NextResponse.json(await listBlogPosts(true));
}

export async function POST(request: Request) {
  const { error } = await requireApiRoles(["admin"]);
  if (error) return error;

  try {
    const body = await request.json();
    const post = await upsertBlogPost(body);
    return NextResponse.json(post, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { error } = await requireApiRoles(["admin"]);
  if (error) return error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ message: "Thiếu id" }, { status: 400 });

  try {
    await deleteBlogPost(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ message: (e as Error).message }, { status: 400 });
  }
}
