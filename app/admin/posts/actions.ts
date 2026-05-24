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

/**
 * Resolves submitted tag slugs against existing tags and links them to the
 * post. Unknown slugs are silently dropped — the UI restricts authors to
 * curated tags, and reaching this code path with an unknown slug indicates
 * either a bug or tampering. Failing the whole save would be hostile; the
 * `tags` table can no longer grow via post saves (migration-only).
 */
async function syncTags(
  supabase: ReturnType<typeof createServiceClient>,
  postId: string,
  tagSlugs: string[],
) {
  const slugs = Array.from(
    new Set(tagSlugs.map((s) => s.trim()).filter(Boolean)),
  );

  await supabase.from("post_tags").delete().eq("post_id", postId);
  if (slugs.length === 0) return;

  const { data: existing } = await supabase
    .from("tags")
    .select("id")
    .in("slug", slugs);

  const tagIds = (existing ?? []).map((t) => t.id);
  if (tagIds.length > 0) {
    await supabase
      .from("post_tags")
      .insert(tagIds.map((tag_id) => ({ post_id: postId, tag_id })));
  }
}

type PostStatus = "draft" | "scheduled" | "published";

/**
 * Resolves `published_at` based on status:
 * - draft: always null (ignore submitted value)
 * - scheduled: required + must be in the future
 * - published: defaults to now() if missing; otherwise uses the submitted value
 *
 * Returns the ISO string to persist, or an error message if validation failed.
 */
function resolvePublishedAt(
  status: PostStatus,
  publishedAtRaw: string,
): { ok: true; value: string | null } | { ok: false; error: string } {
  if (status === "draft") return { ok: true, value: null };

  if (status === "scheduled") {
    if (!publishedAtRaw) {
      return { ok: false, error: "Scheduled posts require a publish date." };
    }
    const date = new Date(publishedAtRaw);
    if (isNaN(date.getTime())) {
      return { ok: false, error: "Invalid publish date." };
    }
    if (date.getTime() <= Date.now()) {
      return {
        ok: false,
        error: "Scheduled publish date must be in the future.",
      };
    }
    return { ok: true, value: date.toISOString() };
  }

  // published
  if (!publishedAtRaw) return { ok: true, value: new Date().toISOString() };
  const date = new Date(publishedAtRaw);
  if (isNaN(date.getTime())) {
    return { ok: false, error: "Invalid publish date." };
  }
  return { ok: true, value: date.toISOString() };
}

export async function savePost(formData: FormData) {
  const { supabase, userId } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() || slugify(title);
  const dek = String(formData.get("dek") ?? "").trim() || null;
  const body_md = String(formData.get("body_md") ?? "");
  const cover_variant = String(formData.get("cover_variant") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "draft") as PostStatus;
  const featured = formData.get("featured") === "on";
  const tagSlugs = formData.getAll("tags").map((v) => String(v));
  const readTimeRaw = String(formData.get("read_time_min") ?? "").trim();
  const read_time_min = readTimeRaw ? Number(readTimeRaw) : null;
  const publishedAtRaw = String(formData.get("published_at") ?? "").trim();

  const errorTarget = id ? `/admin/posts/${id}` : "/admin/posts/new";

  if (!title) redirect(`${errorTarget}?error=missing-title`);

  const publishedAtResult = resolvePublishedAt(status, publishedAtRaw);
  if (!publishedAtResult.ok) {
    redirect(`${errorTarget}?error=${encodeURIComponent(publishedAtResult.error)}`);
  }
  const published_at = publishedAtResult.value;

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
        published_at,
      })
      .eq("id", id);
    if (error) redirect(`/admin/posts/${id}?error=${encodeURIComponent(error.message)}`);
    await syncTags(supabase, id, tagSlugs);
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
        published_at,
        author_id: userId,
      })
      .select("id")
      .single();
    if (error || !data) redirect(`/admin/posts/new?error=${encodeURIComponent(error?.message ?? "unknown")}`);
    await syncTags(supabase, data.id, tagSlugs);
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
