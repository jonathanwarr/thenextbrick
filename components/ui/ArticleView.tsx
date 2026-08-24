import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ConnectCTA from "@/components/ui/ConnectCTA";
import { CategoryIcon, categoryColors, categoryLabels } from "@/components/ui/BrickCard";
import { formatFullDate } from "@/lib/posts/format";
import type { PostDetail } from "@/lib/posts/types";

/**
 * The full reader-facing article page (navbar through footer), shared by the
 * public post route and the admin preview so the preview stays pixel-identical
 * to what readers see.
 *
 * `screenshotPlaceholders` renders draft `[SCREENSHOT: …]` lines as visible
 * placeholder blocks. Preview-only: those lines are stripped before
 * publishing, so the public route must never enable this.
 */
export default function ArticleView({
  post,
  screenshotPlaceholders = false,
}: {
  post: PostDetail;
  screenshotPlaceholders?: boolean;
}) {
  const accentColor = categoryColors[post.category];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 pt-section-y pb-section-b">
        <Link
          href="/bricks"
          className="text-sm mb-8 inline-block hover:opacity-70 transition-opacity"
          style={{ color: "var(--color-text-secondary)" }}
        >
          ← All bricks
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-dark)" }}
          >
            <CategoryIcon category={post.category} />
            {categoryLabels[post.category]}
          </span>
          <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {formatFullDate(post.publishedAt)}
          </span>
          {post.readTimeMin && (
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              · {post.readTimeMin} min read
            </span>
          )}
          {post.authorName && (
            <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              · By {post.authorName}
            </span>
          )}
        </div>

        <h1
          className="text-article font-medium mb-8"
          style={{ fontFamily: "var(--font-family-serif)" }}
        >
          {post.title}
        </h1>

        {post.theBrick && (
          <div
            className="rounded-xl p-5 mb-10 flex flex-col gap-2"
            style={{
              backgroundColor: "var(--color-surface)",
              borderLeft: `4px solid ${accentColor}`,
            }}
          >
            <span
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: "var(--color-text-secondary)" }}
            >
              The Brick
            </span>
            <p
              className="text-lg leading-relaxed"
              style={{
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-family-serif)",
              }}
            >
              {post.theBrick}
            </p>
          </div>
        )}

        <article className="post-body">
          {screenshotPlaceholders ? (
            <BodyWithPlaceholders bodyMd={post.bodyMd} />
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {post.bodyMd}
            </ReactMarkdown>
          )}
        </article>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t" style={{ borderColor: "var(--color-border)" }}>
            <span className="text-[10px] font-semibold uppercase tracking-widest mr-2 self-center" style={{ color: "var(--color-text-muted)" }}>
              Tags
            </span>
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/bricks?tag=${tag}`}
                className="text-xs px-3 py-2 sm:py-1 rounded-full font-medium hover:opacity-80"
                style={{
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text-secondary)",
                  border: "1px solid var(--color-border)",
                }}
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <ConnectCTA location="article" />
      </main>

      <Footer />
    </div>
  );
}

// Article body links point off-page (sources, references, other sites) far
// more often than not, so they open in a new tab rather than navigating the
// reader away from the article.
const markdownComponents: Components = {
  a: ({ href, children, ...props }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  ),
};

// Matches a whole line of the exact form `[SCREENSHOT: description]`. The
// capture group makes String.split interleave descriptions between the
// markdown segments (odd indices).
const SCREENSHOT_LINE = /^\[SCREENSHOT:\s*([^\]]*)\][ \t]*$/m;

function BodyWithPlaceholders({ bodyMd }: { bodyMd: string }) {
  const parts = bodyMd.split(SCREENSHOT_LINE);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <div
            key={i}
            className="rounded-xl my-8 flex flex-col items-center justify-center gap-2 px-8 py-14 text-center"
            style={{
              border: "2px dashed var(--color-border)",
              backgroundColor: "var(--color-surface)",
              fontFamily: "var(--font-family-sans)",
            }}
          >
            <span
              className="block text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "var(--color-text-muted)" }}
            >
              Screenshot
            </span>
            <span className="block text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {part.trim()}
            </span>
          </div>
        ) : part.trim() ? (
          <ReactMarkdown key={i} remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {part}
          </ReactMarkdown>
        ) : null,
      )}
    </>
  );
}
