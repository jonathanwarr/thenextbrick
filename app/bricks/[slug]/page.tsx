import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ConnectCTA from "@/components/ui/ConnectCTA";
import { CategoryIcon, categoryColors, categoryLabels } from "@/components/ui/BrickCard";
import { getPostBySlug } from "@/lib/posts/queries";
import { formatFullDate } from "@/lib/posts/format";
import { siteConfig, absoluteUrl, jsonLdString } from "@/lib/site";

type PostParams = Promise<{ slug: string }>;

/** Trim a long blurb to a tidy meta-description length on a word boundary. */
function metaDescription(post: { dek: string | null; theBrick: string | null }): string {
  const raw = post.dek ?? post.theBrick ?? siteConfig.description;
  if (raw.length <= 160) return raw;
  return `${raw.slice(0, 157).replace(/\s+\S*$/, "")}…`;
}

export async function generateMetadata({ params }: { params: PostParams }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not found", robots: { index: false } };

  const description = metaDescription(post);
  const url = `/bricks/${slug}`;
  const published = post.publishedAt?.toISOString();
  const modified = (post.updatedAt ?? post.publishedAt)?.toISOString();

  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url,
      siteName: siteConfig.name,
      publishedTime: published,
      modifiedTime: modified,
      authors: [post.authorName ?? siteConfig.author.name],
      section: categoryLabels[post.category],
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title: post.title, description },
  };
}

export default async function PostPage({ params }: { params: PostParams }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const accentColor = categoryColors[post.category];
  const url = `/bricks/${slug}`;

  const blogPostingLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: metaDescription(post),
    datePublished: post.publishedAt?.toISOString(),
    dateModified: (post.updatedAt ?? post.publishedAt)?.toISOString(),
    author: {
      "@type": "Person",
      name: post.authorName ?? siteConfig.author.name,
      url: siteConfig.author.linkedin,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(url) },
    url: absoluteUrl(url),
    image: absoluteUrl(`${url}/opengraph-image`),
    articleSection: categoryLabels[post.category],
    keywords: post.tags.join(", "),
    inLanguage: "en-US",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(blogPostingLd) }}
      />
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
