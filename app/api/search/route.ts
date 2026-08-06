import { NextResponse, type NextRequest } from "next/server";
import { searchPosts } from "@/lib/posts/queries";
import { createClient } from "@/lib/supabase/server";
import { formatShortDate } from "@/lib/posts/format";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ tags: [], articles: [], total: 0 });
  }

  const supabase = await createClient();
  // "customer support" must find the customer-support tag: match the
  // hyphenized query against slugs and the raw query against display names.
  // Commas/parens are stripped — they are PostgREST .or() syntax.
  const nameNeedle = q.toLowerCase().replace(/[,()]/g, "");
  const slugNeedle = nameNeedle.replace(/\s+/g, "-");
  const [articles, tagMatchesRes] = await Promise.all([
    searchPosts(q),
    supabase
      .from("tags")
      .select("slug, name, post_tags(count)")
      .or(`slug.ilike.%${slugNeedle}%,name.ilike.%${nameNeedle}%`)
      .limit(3),
  ]);

  const tags = (tagMatchesRes.data ?? []).map((t: { slug: string; name: string; post_tags: { count: number }[] }) => ({
    slug: t.slug,
    name: t.name,
    count: t.post_tags?.[0]?.count ?? 0,
  }));

  return NextResponse.json({
    tags,
    articles: articles.slice(0, 7).map((a) => ({
      slug: a.slug,
      title: a.title,
      category: a.category,
      tags: a.tags,
      date: formatShortDate(a.publishedAt),
    })),
    total: articles.length,
  });
}
