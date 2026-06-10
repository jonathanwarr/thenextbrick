import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/ui/SearchBar";
import BrickCard, { categoryColors, categoryLabels, CategoryIcon } from "@/components/ui/BrickCard";
import TagFilter from "@/components/ui/TagFilter";
import Link from "next/link";
import { listPublishedPosts, getFeaturedPost, loadTagTaxonomy, searchPosts } from "@/lib/posts/queries";
import { formatShortDate } from "@/lib/posts/format";
import type { PostListItem } from "@/lib/posts/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Every brick, searchable — Articles, Playbooks, and Essays on putting Claude to work. Filter by topic or search by keyword.",
  alternates: { canonical: "/bricks" },
};

const PAGE_SIZE = 11;

type BricksSearchParams = Promise<{ tag?: string | string[]; page?: string; q?: string }>;

function FeaturedCard({ article }: { article: PostListItem }) {
  const accentColor = categoryColors[article.category];

  return (
    <Link
      href={`/bricks/${article.slug}`}
      className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{
        backgroundColor: "var(--color-surface-raised)",
        border: "1px solid var(--color-border)",
        borderTop: `3px solid ${accentColor}`,
      }}
    >
      <div className="w-full h-24 sm:h-auto sm:w-1/4 shrink-0 relative overflow-hidden">
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
  const activeTags = Array.isArray(params.tag)
    ? params.tag
    : params.tag
      ? [params.tag]
      : [];
  const searchQuery = params.q?.trim();
  const page = Math.max(1, Number(params.page) || 1);

  const [allPosts, taxonomy, featured] = await Promise.all([
    searchQuery
      ? searchPosts(searchQuery)
      : listPublishedPosts({ tags: activeTags }),
    loadTagTaxonomy(),
    activeTags.length > 0 || searchQuery ? Promise.resolve(null) : getFeaturedPost(),
  ]);

  const totalPosts = allPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / PAGE_SIZE));
  const paged = allPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const featuredArticle = featured && page === 1 ? featured : null;
  const gridArticles = featuredArticle
    ? paged.filter((p) => p.id !== featuredArticle.id).slice(0, PAGE_SIZE - 1)
    : paged;

  function pageHref(targetPage: number) {
    const sp = new URLSearchParams();
    for (const t of activeTags) sp.append("tag", t);
    if (searchQuery) sp.set("q", searchQuery);
    if (targetPage > 1) sp.set("page", String(targetPage));
    const s = sp.toString();
    return s ? `/bricks?${s}` : "/bricks";
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-8 pt-section-y pb-section-b">
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

        <h1 className="text-title font-medium mb-2">Every Brick, Searchable.</h1>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
          Search for any content by title, tag, or keyword.
        </p>

        <div className="mb-5">
          <SearchBar size="page" initialQuery={searchQuery ?? ""} />
        </div>

        <div className="mb-12 lg:mb-16">
          <span className="block text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-text-muted)" }}>
            Filter by tag
          </span>
          <TagFilter groups={taxonomy.groups} tags={taxonomy.tags} activeTags={activeTags} />
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
                : activeTags.length > 0
                  ? `No posts match ${activeTags.length === 1 ? `"${activeTags[0]}"` : "those tags"}.`
                  : "No posts published yet."}
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {activeTags.length > 0 || searchQuery ? (
                <Link href="/bricks" style={{ color: "var(--color-primary)" }}>
                  Clear filter
                </Link>
              ) : (
                "Check back soon."
              )}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5">
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-12 pt-6 border-t" style={{ borderColor: "var(--color-border)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Page {page} of {totalPages} | {totalPosts} Articles
            </p>
            <div className="flex items-center gap-1">
              {page > 1 && (
                <Link
                  href={pageHref(page - 1)}
                  className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-secondary)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  ←
                </Link>
              )}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
                  const isActive = n === page;
                  return (
                    <Link
                      key={n}
                      href={pageHref(n)}
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
              </div>
              {page < totalPages && (
                <Link
                  href={pageHref(page + 1)}
                  className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs font-medium"
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
