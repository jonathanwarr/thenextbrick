"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function requireAdmin() {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await authClient
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) redirect("/login?error=not-admin");
  return { supabase: createServiceClient(), userId: user.id };
}

async function syncTags(
  supabase: ReturnType<typeof createServiceClient>,
  postId: string,
  tagSlugsCsv: string,
) {
  const slugs = Array.from(
    new Set(
      tagSlugsCsv
        .split(",")
        .map((s) => slugify(s))
        .filter(Boolean),
    ),
  );

  await supabase.from("post_tags").delete().eq("post_id", postId);
  if (slugs.length === 0) return;

  const { data: existing } = await supabase
    .from("tags")
    .select("id, slug")
    .in("slug", slugs);

  const existingSlugs = new Set((existing ?? []).map((t) => t.slug));
  const newSlugs = slugs.filter((s) => !existingSlugs.has(s));

  if (newSlugs.length > 0) {
    const { data: inserted } = await supabase
      .from("tags")
      .insert(newSlugs.map((slug) => ({ slug, name: slug })))
      .select("id, slug");
    if (inserted) existing?.push(...inserted);
  }

  const tagIds = (existing ?? []).map((t) => t.id);
  if (tagIds.length > 0) {
    await supabase
      .from("post_tags")
      .insert(tagIds.map((tag_id) => ({ post_id: postId, tag_id })));
  }
}

export async function savePost(formData: FormData) {
  const { supabase, userId } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() || slugify(title);
  const dek = String(formData.get("dek") ?? "").trim() || null;
  const body_md = String(formData.get("body_md") ?? "");
  const cover_variant = String(formData.get("cover_variant") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "draft") as
    | "draft"
    | "scheduled"
    | "published";
  const featured = formData.get("featured") === "on";
  const tagsCsv = String(formData.get("tags") ?? "");
  const readTimeRaw = String(formData.get("read_time_min") ?? "").trim();
  const read_time_min = readTimeRaw ? Number(readTimeRaw) : null;

  if (!title) redirect("/admin/posts/new?error=missing-title");

  if (id) {
    const { error } = await supabase
      .from("posts")
      .update({
        title,
        slug,
        dek,
        body_md,
        cover_variant,
        status,
        featured,
        read_time_min,
      })
      .eq("id", id);
    if (error) redirect(`/admin/posts/${id}?error=${encodeURIComponent(error.message)}`);
    await syncTags(supabase, id, tagsCsv);
    revalidatePath("/admin/posts");
    revalidatePath(`/admin/posts/${id}`);
    revalidatePath(`/bricks/${slug}`);
    revalidatePath("/bricks");
    revalidatePath("/");
    redirect(`/admin/posts/${id}?saved=1`);
  } else {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        title,
        slug,
        dek,
        body_md,
        cover_variant,
        status,
        featured,
        read_time_min,
        author_id: userId,
      })
      .select("id")
      .single();
    if (error || !data) redirect(`/admin/posts/new?error=${encodeURIComponent(error?.message ?? "unknown")}`);
    await syncTags(supabase, data.id, tagsCsv);
    revalidatePath("/admin/posts");
    revalidatePath("/bricks");
    revalidatePath("/");
    redirect(`/admin/posts/${data.id}?saved=1`);
  }
}

export async function deletePost(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("posts").delete().eq("id", id);
  revalidatePath("/admin/posts");
  revalidatePath("/bricks");
  revalidatePath("/");
  redirect("/admin/posts");
}
