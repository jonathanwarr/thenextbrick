import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { normalizeCategory, type PostListItem, type PostDetail } from "./types";
import type { TagFilterGroup, TagFilterTag } from "@/components/ui/TagFilter";

type PostRow = {
  id: string;
  slug: string;
  title: string;
  dek: string | null;
  the_brick: string | null;
  body_md?: string;
  category: string;
  status: string;
  featured: boolean;
  published_at: string | null;
  updated_at: string | null;
  read_time_min: number | null;
  author?: { display_name: string | null } | null;
  post_tags?: {
    tag: {
      slug: string;
      sort_order: number | null;
      group: { sort_order: number | null } | null;
    } | null;
  }[];
};

function toListItem(row: PostRow): PostListItem {
  // Order tags canonically by the taxonomy: first by group sort_order
  // (Entry Points before Core Skills …), then by the tag's own sort_order
  // within its group (Start Here before Quick Wins). Ungrouped tags sort last.
  const tagSlugs = (row.post_tags ?? [])
    .map((pt) => pt.tag)
    .filter((t): t is NonNullable<typeof t> => Boolean(t?.slug))
    .sort((a, b) => {
      const ga = a.group?.sort_order ?? Number.POSITIVE_INFINITY;
      const gb = b.group?.sort_order ?? Number.POSITIVE_INFINITY;
      if (ga !== gb) return ga - gb;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    })
    .map((t) => t.slug);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    dek: row.dek,
    theBrick: row.the_brick,
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    readTimeMin: row.read_time_min,
    featured: row.featured,
    category: normalizeCategory(row.category),
    tags: tagSlugs,
  };
}

function toDetail(row: PostRow): PostDetail {
  return {
    ...toListItem(row),
    bodyMd: row.body_md ?? "",
    authorName: row.author?.display_name ?? null,
  };
}

const PUBLISHED_LIST_SELECT = `
  id,
  slug,
  title,
  dek,
  the_brick,
  category,
  status,
  featured,
  published_at,
  updated_at,
  read_time_min,
  post_tags ( tag:tags ( slug, sort_order, group:tag_groups ( sort_order ) ) )
`;

const PUBLISHED_DETAIL_SELECT = `
  id,
  slug,
  title,
  dek,
  the_brick,
  category,
  body_md,
  status,
  featured,
  published_at,
  updated_at,
  read_time_min,
  author:profiles ( display_name ),
  post_tags ( tag:tags ( slug, sort_order, group:tag_groups ( sort_order ) ) )
`;

export async function listPublishedPosts(options: {
  limit?: number;
  tags?: string[];
  order?: "newest" | "oldest";
} = {}): Promise<PostListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select(PUBLISHED_LIST_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: options.order === "oldest" });

  const tagSlugs = (options.tags ?? []).filter(Boolean);
  if (tagSlugs.length > 0) {
    // Match ANY of the selected tags (union): the post must carry at least one.
    const { data: tagRows } = await supabase
      .from("tags")
      .select("id")
      .in("slug", tagSlugs);
    const tagIds = (tagRows ?? []).map((t) => t.id);
    if (tagIds.length === 0) return [];
    const { data: postIds } = await supabase
      .from("post_tags")
      .select("post_id")
      .in("tag_id", tagIds);
    const ids = Array.from(new Set((postIds ?? []).map((p) => p.post_id)));
    if (ids.length === 0) return [];
    query = query.in("id", ids);
  }

  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) {
    console.error("listPublishedPosts error", error);
    return [];
  }
  return ((data ?? []) as unknown as PostRow[]).map(toListItem);
}

export async function getFeaturedPost(): Promise<PostListItem | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(PUBLISHED_LIST_SELECT)
    .eq("status", "published")
    .eq("featured", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return toListItem(data as unknown as PostRow);
}

// Wrapped in React cache so generateMetadata + the page component share one
// query per request (same slug → one DB round-trip).
export const getPostBySlug = cache(
  async (slug: string): Promise<PostDetail | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select(PUBLISHED_DETAIL_SELECT)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) return null;
    return toDetail(data as unknown as PostRow);
  },
);

export async function listPopularTags(limit = 8): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("tags").select("slug").limit(limit);
  return (data ?? []).map((t) => t.slug);
}

/**
 * Public, grouped tag taxonomy for the Articles-page filter. Uses the anon
 * client — `tag_groups` and `tags` are both RLS-readable by anon — so this is
 * safe to call from public server components (unlike the admin loader, which
 * uses the service client).
 */
export async function loadTagTaxonomy(): Promise<{
  groups: TagFilterGroup[];
  tags: TagFilterTag[];
}> {
  const supabase = await createClient();
  const [{ data: groups }, { data: tags }] = await Promise.all([
    supabase.from("tag_groups").select("id, name, sort_order").order("sort_order"),
    supabase.from("tags").select("id, slug, name, group_id, sort_order").order("sort_order"),
  ]);
  return {
    groups: (groups ?? []).map((g) => ({
      id: g.id,
      name: g.name,
      sortOrder: g.sort_order,
    })),
    tags: (tags ?? []).map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      groupId: t.group_id,
      sortOrder: t.sort_order,
    })),
  };
}

export async function searchPosts(query: string): Promise<PostListItem[]> {
  if (!query.trim()) return [];
  const supabase = await createClient();

  const tsq = query
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9-]/g, ""))
    .filter(Boolean)
    .map((w) => `${w}:*`)
    .join(" & ");

  const orFilters = [`title.ilike.%${query}%`, `dek.ilike.%${query}%`];
  if (tsq) orFilters.push(`search.fts.${tsq}`);

  const { data: ftsResults } = await supabase
    .from("posts")
    .select(PUBLISHED_LIST_SELECT)
    .eq("status", "published")
    .or(orFilters.join(","))
    .order("published_at", { ascending: false })
    .limit(20);

  const ftsList = ((ftsResults ?? []) as unknown as PostRow[]).map(toListItem);

  const { data: tagRows } = await supabase
    .from("tags")
    .select("id")
    .ilike("slug", `%${query.toLowerCase()}%`);
  const tagIds = (tagRows ?? []).map((t) => t.id);

  if (tagIds.length === 0) return ftsList;

  const { data: tagPostIds } = await supabase
    .from("post_tags")
    .select("post_id")
    .in("tag_id", tagIds);
  const postIds = Array.from(new Set((tagPostIds ?? []).map((p) => p.post_id)));

  if (postIds.length === 0) return ftsList;

  const { data: tagPosts } = await supabase
    .from("posts")
    .select(PUBLISHED_LIST_SELECT)
    .eq("status", "published")
    .in("id", postIds)
    .limit(20);

  const tagList = ((tagPosts ?? []) as unknown as PostRow[]).map(toListItem);

  const merged = new Map<string, PostListItem>();
  for (const p of [...ftsList, ...tagList]) merged.set(p.id, p);
  return Array.from(merged.values());
}
