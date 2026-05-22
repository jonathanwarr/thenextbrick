import { createClient } from "@/lib/supabase/server";
import { categoryFromTags, type PostListItem, type PostDetail } from "./types";

type PostRow = {
  id: string;
  slug: string;
  title: string;
  dek: string | null;
  body_md?: string;
  status: string;
  featured: boolean;
  published_at: string | null;
  read_time_min: number | null;
  author?: { display_name: string | null } | null;
  post_tags?: { tag: { slug: string } | null }[];
};

function toListItem(row: PostRow): PostListItem {
  const tagSlugs = (row.post_tags ?? [])
    .map((pt) => pt.tag?.slug)
    .filter((s): s is string => Boolean(s));

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    dek: row.dek,
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    readTimeMin: row.read_time_min,
    featured: row.featured,
    category: categoryFromTags(tagSlugs),
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
  status,
  featured,
  published_at,
  read_time_min,
  post_tags ( tag:tags ( slug ) )
`;

const PUBLISHED_DETAIL_SELECT = `
  id,
  slug,
  title,
  dek,
  body_md,
  status,
  featured,
  published_at,
  read_time_min,
  author:profiles ( display_name ),
  post_tags ( tag:tags ( slug ) )
`;

export async function listPublishedPosts(options: {
  limit?: number;
  tag?: string;
  order?: "newest" | "oldest";
} = {}): Promise<PostListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select(PUBLISHED_LIST_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: options.order === "oldest" });

  if (options.tag) {
    const { data: tag } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", options.tag)
      .maybeSingle();
    if (!tag) return [];
    const { data: postIds } = await supabase
      .from("post_tags")
      .select("post_id")
      .eq("tag_id", tag.id);
    const ids = (postIds ?? []).map((p) => p.post_id);
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

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(PUBLISHED_DETAIL_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  return toDetail(data as unknown as PostRow);
}

export async function listPopularTags(limit = 8): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("tags").select("slug").limit(limit);
  return (data ?? []).map((t) => t.slug);
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
