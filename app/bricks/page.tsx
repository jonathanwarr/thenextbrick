import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/ui/SearchBar";
import BrickCard, { categoryColors, categoryLabels, CategoryIcon } from "@/components/ui/BrickCard";
import Link from "next/link";
import { listPublishedPosts, getFeaturedPost, listPopularTags, searchPosts } from "@/lib/posts/queries";
import { formatShortDate } from "@/lib/posts/format";
import type { PostListItem } from "@/lib/posts/types";

const PAGE_SIZE = 11;

type BricksSearchParams = Promise<{ tag?: string; sort?: string; page?: string; q?: string }>;

function FeaturedCard({ article }: { article: PostListItem }) {
  const accentColor = categoryColors[article.category];

  return (
    <Link
      href={`/bricks/${article.slug}`}
      className="col-span-2 flex rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{
        backgroundColor: "var(--color-surface-raised)",
        border: "1px solid var(--color-border)",
        borderTop: `3px solid ${accentColor}`,
      }}
    >
      <div className="w-2/5 shrink-0 relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundColor: "var(--color-secondary)", opacity: 0.7 }} />
        <span
          className="absolute top-3 left-3 z-10 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-dark)" }}
        >
          Featured
        </span>
      </div>

      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex items-center justify-between">
          <span
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide font-family-sans"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <CategoryIcon category={article.category} />
            {categoryLabels[article.category]}
          </span>
          <span className="text-sm font-family-serif" style={{ color: "var(--color-text-secondary)" }}>
            {formatShortDate(article.publishedAt)}
          </span>
        </div>

        <p className="text-xl font-medium leading-snug font-family-serif">
          {article.title}
        </p>

        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-1">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default async function BricksPage({
  searchParams,
}: {
  searchParams: BricksSearchParams;
}) {
  const params = await searchParams;
  const activeTag = params.tag;
  const searchQuery = params.q?.trim();
  const sort = params.sort === "oldest" ? "oldest" : "newest";
  const page = Math.max(1, Number(params.page) || 1);

  const [allPosts, popularTags, featured] = await Promise.all([
    searchQuery
      ? searchPosts(searchQuery)
      : listPublishedPosts({ tag: activeTag, order: sort }),
    listPopularTags(8),
    activeTag || searchQuery ? Promise.resolve(null) : getFeaturedPost(),
  ]);

  const totalPosts = allPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / PAGE_SIZE));
  const paged = allPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const featuredArticle = featured && page === 1 ? featured : null;
  const gridArticles = featuredArticle
    ? paged.filter((p) => p.id !== featuredArticle.id).slice(0, PAGE_SIZE - 1)
    : paged;

  function buildQuery(updates: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    if (activeTag) sp.set("tag", activeTag);
    if (searchQuery) sp.set("q", searchQuery);
    if (sort !== "newest") sp.set("sort", sort);
    if (page > 1) sp.set("page", String(page));
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined) sp.delete(k);
      else sp.set(k, v);
    }
    const s = sp.toString();
    return s ? `/bricks?${s}` : "/bricks";
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-12 pb-0">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest mb-3 flex items-center gap-2"
          style={{ color: "var(--color-text-muted)" }}
        >
          Archive
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-family-sans font-semibold tracking-wide"
            style={{ backgroundColor: "var(--color-surface)", color: "var(--color-text-secondary)" }}
          >
            {totalPosts} brick{totalPosts === 1 ? "" : "s"}
          </span>
        </p>

        <h1 className="text-4xl font-medium mb-2">Every Brick, Searchable.</h1>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
          Search for any content by title, tag, or keyword.
        </p>

        <div className="flex gap-3 mb-5">
          <div className="flex-1">
            <SearchBar size="page" initialQuery={searchQuery ?? ""} />
          </div>
          <Link
            href={buildQuery({ sort: sort === "newest" ? "oldest" : undefined, page: undefined })}
            className="px-4 py-2 rounded-xl text-sm font-medium border shrink-0 transition-all hover:brightness-[0.93]"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-secondary)",
            }}
          >
            Sort: {sort === "newest" ? "Newest ↓" : "Oldest ↑"}
          </Link>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-16">
          <span className="text-[10px] font-semibold uppercase tracking-widest shrink-0" style={{ color: "var(--color-text-muted)" }}>
            Tags
          </span>
          {popularTags.length === 0 ? (
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              No tags yet
            </span>
          ) : (
            popularTags.map((tag) => {
              const isActive = activeTag === tag;
              return (
                <Link
                  key={tag}
                  href={buildQuery({ tag: isActive ? undefined : tag, page: undefined })}
                  className="text-xs px-3 py-1 rounded-full font-medium transition-colors"
                  style={{
                    backgroundColor: isActive ? "var(--color-primary)" : "var(--color-surface)",
                    color: isActive ? "var(--color-dark)" : "var(--color-text-secondary)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {tag}
                </Link>
              );
            })
          )}
        </div>

        {totalPosts === 0 ? (
          <div
            className="rounded-xl p-12 text-center"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px dashed var(--color-border)",
            }}
          >
            <p className="font-medium mb-1">
              {searchQuery
                ? `No results for "${searchQuery}".`
                : activeTag
                  ? `No posts tagged "${activeTag}".`
                  : "No posts published yet."}
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {activeTag || searchQuery ? (
                <Link href="/bricks" style={{ color: "var(--color-primary)" }}>
                  Clear filter
                </Link>
              ) : (
                "Check back soon."
              )}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredArticle && <FeaturedCard article={featuredArticle} />}
            {gridArticles.map((article) => (
              <BrickCard
                key={article.id}
                slug={article.slug}
                title={article.title}
                date={formatShortDate(article.publishedAt)}
                category={article.category}
                tags={article.tags}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-12 pt-6 border-t" style={{ borderColor: "var(--color-border)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Page {page} of {totalPages} | {totalPosts} Articles
            </p>
            <div className="flex items-center gap-1">
              {page > 1 && (
                <Link
                  href={buildQuery({ page: page === 2 ? undefined : String(page - 1) })}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-secondary)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  ←
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
                const isActive = n === page;
                return (
                  <Link
                    key={n}
                    href={buildQuery({ page: n === 1 ? undefined : String(n) })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium"
                    style={{
                      backgroundColor: isActive ? "var(--color-primary)" : "var(--color-surface)",
                      color: isActive ? "var(--color-dark)" : "var(--color-text-secondary)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    {n}
                  </Link>
                );
              })}
              {page < totalPages && (
                <Link
                  href={buildQuery({ page: String(page + 1) })}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-secondary)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  →
                </Link>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
