import { notFound } from "next/navigation";
import PostForm, { type PostFormValues } from "@/components/admin/PostForm";
import { createServiceClient } from "@/lib/supabase/server";
import { loadTagPickerData } from "@/lib/admin/tags";

type EditPostParams = Promise<{ id: string }>;
type EditPostSearchParams = Promise<{ saved?: string; error?: string }>;

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: EditPostParams;
  searchParams: EditPostSearchParams;
}) {
  const { id } = await params;
  const { saved, error } = await searchParams;

  const supabase = createServiceClient();
  const [{ data: post }, { groups, tags: availableTags }] = await Promise.all([
    supabase
      .from("posts")
      .select(`
        id,
        slug,
        title,
        dek,
        body_md,
        cover_variant,
        status,
        featured,
        read_time_min,
        published_at,
        post_tags ( tag:tags ( slug ) )
      `)
      .eq("id", id)
      .maybeSingle(),
    loadTagPickerData(),
  ]);

  if (!post) notFound();

  const tags = ((post.post_tags as { tag: { slug: string } | null }[] | null) ?? [])
    .map((pt) => pt.tag?.slug)
    .filter((s): s is string => Boolean(s));

  return (
    <PostForm
      saved={saved === "1"}
      error={error}
      availableGroups={groups}
      availableTags={availableTags}
      values={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        dek: post.dek ?? "",
        body_md: post.body_md ?? "",
        cover_variant: post.cover_variant ?? "",
        status: post.status as PostFormValues["status"],
        featured: post.featured,
        read_time_min: post.read_time_min,
        tags,
        published_at: post.published_at,
      }}
    />
  );
}
