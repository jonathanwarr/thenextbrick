import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CategoryIcon, categoryColors, categoryLabels } from "@/components/ui/BrickCard";
import { getPostBySlug } from "@/lib/posts/queries";
import { formatFullDate } from "@/lib/posts/format";

type PostParams = Promise<{ slug: string }>;

export default async function PostPage({ params }: { params: PostParams }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const accentColor = categoryColors[post.category];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 pt-16 pb-12">
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
            style={{ backgroundColor: accentColor, color: "var(--color-dark)" }}
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
        </div>

        <h1
          className="text-4xl md:text-5xl font-medium leading-tight mb-4"
          style={{ fontFamily: "var(--font-family-serif)" }}
        >
          {post.title}
        </h1>

        {post.dek && (
          <p
            className="text-xl mb-10 leading-snug"
            style={{
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-family-serif)",
            }}
          >
            {post.dek}
          </p>
        )}

        {post.authorName && (
          <p className="text-sm mb-10" style={{ color: "var(--color-text-muted)" }}>
            By {post.authorName}
          </p>
        )}

        <article className="post-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.bodyMd}</ReactMarkdown>
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
                className="text-xs px-3 py-1 rounded-full font-medium hover:opacity-80"
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
      </main>

      <Footer />
    </div>
  );
}
