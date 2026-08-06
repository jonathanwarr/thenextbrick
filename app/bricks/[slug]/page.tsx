import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleView from "@/components/ui/ArticleView";
import { categoryLabels } from "@/components/ui/BrickCard";
import { getPostBySlug } from "@/lib/posts/queries";
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(blogPostingLd) }}
      />
      <ArticleView post={post} />
    </>
  );
}
