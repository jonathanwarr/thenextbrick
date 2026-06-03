import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/ui/SearchBar";
import BrickCard from "@/components/ui/BrickCard";
import Link from "next/link";
import { listPublishedPosts } from "@/lib/posts/queries";
import { formatShortDate } from "@/lib/posts/format";
import { siteConfig, jsonLdString } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      inLanguage: "en-US",
      publisher: { "@id": `${siteConfig.url}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${siteConfig.url}/#person`,
      name: siteConfig.author.name,
      url: siteConfig.url,
      sameAs: [siteConfig.author.linkedin],
      description:
        "Operations leader turned AI enablement practitioner — helping experienced professionals put Claude to work.",
    },
  ],
};

export default async function HomePage() {
  const recent = await listPublishedPosts({ limit: 3 });

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(homeJsonLd) }}
      />
      <Navbar />

      <main className="flex-1 flex flex-col min-h-0">

        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-20">
          {/* Editorial rule */}
          <div
            className="flex items-center gap-4 w-full max-w-[640px] -mt-6 mb-11"
            style={{ animation: "fadeUp 0.5s ease both", animationDelay: "0ms" }}
          >
            <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
            <span
              className="text-[11px] font-bold tracking-[0.15em] uppercase whitespace-nowrap"
              style={{ color: "var(--color-text-muted)" }}
            >
              Foundations
              <span className="mx-2.5 opacity-50">·</span>
              Playbooks
              <span className="mx-2.5 opacity-50">·</span>
              Signals
              <span className="mx-2.5 opacity-50">·</span>
              Essays
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
          </div>

          {/* Headline */}
          <h1
            className="text-4xl md:text-5xl font-bold leading-none mb-2"
            style={{
              animation: "fadeUp 0.5s ease both",
              animationDelay: "80ms",
            }}
          >
            <span className="font-semibold" style={{ color: "var(--color-primary)" }}>Claude</span>{" "}
            <span className="font-normal">for Professionals</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-xl mb-14 font-family-serif"
            style={{
              color: "var(--color-text-secondary)",
              letterSpacing: "var(--tracking-subtitle)",
              animation: "fadeUp 0.5s ease both",
              animationDelay: "160ms",
            }}
          >
            AI Enablement. One Brick at a Time.
          </p>

          {/* Search */}
          <div
            className="w-full"
            style={{
              maxWidth: "640px",
              animation: "fadeUp 0.5s ease both",
              animationDelay: "240ms",
            }}
          >
            <SearchBar size="hero" />
          </div>
        </section>

        {/* Articles */}
        <section className="flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col pt-5 pb-6 min-h-0">

          {/* Section header */}
          <div className="flex items-center gap-3 mb-4">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.18em] shrink-0"
              style={{ color: "var(--color-text-muted)" }}
            >
              Latest
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
            <Link
              href="/bricks"
              className="text-xs font-semibold shrink-0 transition-opacity hover:opacity-70"
              style={{ color: "var(--color-primary)" }}
            >
              Browse all →
            </Link>
          </div>

          {/* Article grid: featured (left, row-span-2) + 2 standard stacked (right) */}
          {recent.length > 0 ? (
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "2fr 1fr", gridTemplateRows: "1fr 1fr", flex: "1 1 0", minHeight: 0 }}
            >
              {recent[0] && (
                <BrickCard
                  slug={recent[0].slug}
                  title={recent[0].title}
                  date={formatShortDate(recent[0].publishedAt)}
                  category={recent[0].category}
                  tags={recent[0].tags}
                  excerpt={recent[0].dek ?? undefined}
                  theBrick={recent[0].theBrick ?? undefined}
                  featured
                  className="row-span-2"
                />
              )}
              {recent[1] && (
                <BrickCard
                  slug={recent[1].slug}
                  title={recent[1].title}
                  date={formatShortDate(recent[1].publishedAt)}
                  category={recent[1].category}
                  tags={recent[1].tags}
                  excerpt={recent[1].dek ?? undefined}
                />
              )}
              {recent[2] && (
                <BrickCard
                  slug={recent[2].slug}
                  title={recent[2].title}
                  date={formatShortDate(recent[2].publishedAt)}
                  category={recent[2].category}
                  tags={recent[2].tags}
                  excerpt={recent[2].dek ?? undefined}
                />
              )}
            </div>
          ) : (
            <div
              className="rounded-xl p-8 text-center"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px dashed var(--color-border)",
                flex: "1 1 0",
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p className="font-medium mb-1">No articles yet.</p>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                The first brick lands soon.
              </p>
            </div>
          )}

        </section>
      </main>

      <Footer />
    </div>
  );
}
