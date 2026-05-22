"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onQueryChange?: (q: string) => void;
}

/* ── Icons (Font Awesome shapes, inline SVG) ── */
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}
function FoundationsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
function BuildsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
function ObservationsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M2 12s3.273-7 10-7 10 7 10 7-3.273 7-10 7S2 12 2 12z" />
    </svg>
  );
}
function EssaysIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

type Category = "foundations" | "builds" | "observations" | "essays";

const categoryIcon: Record<Category, React.ReactNode> = {
  foundations: <FoundationsIcon />,
  builds: <BuildsIcon />,
  observations: <ObservationsIcon />,
  essays: <EssaysIcon />,
};

const categoryLabel: Record<Category, string> = {
  foundations: "Foundations",
  builds: "Builds",
  observations: "Observations",
  essays: "Essays",
};

/* ── Mock data ── replace with real search once DB is wired ── */
const MOCK_ARTICLES = [
  { slug: "stop-debugging-prompts", title: "Stop debugging prompts, start debugging schemas instead", category: "foundations" as Category, tags: ["tool-use"] },
  { slug: "field-guide-structured-outputs", title: "A field guide to structured outputs", category: "foundations" as Category, tags: ["prompting", "structured-output"] },
  { slug: "scratchpads-drafts", title: "Scratchpads, drafts & the art of thinking out loud", category: "foundations" as Category, tags: ["prompting"] },
  { slug: "building-agents-sales-outreach", title: "Building Managed Agents for Sales Outreach", category: "builds" as Category, tags: ["agents", "workflows"] },
  { slug: "ai-anxiety-essay", title: "AI Anxiety, an essay on the impact of unknown variables", category: "essays" as Category, tags: ["cowork"] },
  { slug: "agents-vs-skills", title: "Here's what I noticed about agents vs skills", category: "observations" as Category, tags: ["agents"] },
  { slug: "agent-workflow-management", title: "Agent Workflow Management", category: "foundations" as Category, tags: ["agents", "workflows"] },
  { slug: "agent-workflow-guardrails", title: "Setting Up Agent Workflow Guardrails", category: "foundations" as Category, tags: ["agents"] },
  { slug: "managed-agents-cs-teams", title: "How Managed Agents Will Affect Customer Success Teams", category: "essays" as Category, tags: ["agents", "cowork"] },
];

const MOCK_TAGS = [
  { name: "prompting", count: 14 },
  { name: "agents", count: 9 },
  { name: "projects", count: 7 },
  { name: "workflows", count: 6 },
  { name: "tool-use", count: 5 },
];

export default function SearchModal({ isOpen, onClose, initialQuery = "", onQueryChange }: SearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialQuery]);

  const matchingTags = query.length > 0
    ? MOCK_TAGS.filter((t) => t.name.includes(query.toLowerCase())).slice(0, 2)
    : [];

  const matchingArticles = query.length > 0
    ? MOCK_ARTICLES.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.tags.some((t) => t.includes(query.toLowerCase()))
      ).slice(0, 7 - matchingTags.length)
    : MOCK_ARTICLES.slice(0, 5);

  const totalResults = query.length > 0
    ? MOCK_ARTICLES.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.tags.some((t) => t.includes(query.toLowerCase()))
      ).length
    : 0;

  const allItems = [
    ...matchingTags.map((t) => ({ type: "tag" as const, data: t })),
    ...matchingArticles.map((a) => ({ type: "article" as const, data: a })),
  ];

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && allItems[selectedIndex]) {
      const item = allItems[selectedIndex];
      if (item.type === "tag") router.push(`/tags/${(item.data as typeof MOCK_TAGS[0]).name}`);
      else router.push(`/bricks/${(item.data as typeof MOCK_ARTICLES[0]).slug}`);
      onClose();
    }
  }

  function handleQueryChange(val: string) {
    setQuery(val);
    setSelectedIndex(0);
    onQueryChange?.(val);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
      style={{ backgroundColor: "rgba(44,33,24,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[900px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: "var(--color-surface-raised)" }}
      >
        {/* Input row */}
        <div
          className="flex items-center gap-3 px-5 py-4 border-b"
          style={{
            borderColor: "var(--color-border)",
            outline: "1.5px solid rgba(217,172,140,0.6)",
            outlineOffset: "-1.5px",
          }}
        >
          <span style={{ color: "var(--color-text-muted)" }}>
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search articles, essays, tags…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--color-text-primary)" }}
          />
          {totalResults > 0 && (
            <span className="text-xs shrink-0" style={{ color: "var(--color-text-muted)" }}>
              {totalResults} result{totalResults !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto">
          {/* Tag suggestions */}
          {matchingTags.length > 0 && (
            <>
              {matchingTags.map((tag, i) => (
                <Link
                  key={tag.name}
                  href={`/tags/${tag.name}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-5 py-3 transition-colors"
                  style={{
                    backgroundColor: selectedIndex === i ? "var(--color-surface)" : "transparent",
                  }}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <span
                    className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                    style={{ backgroundColor: "var(--color-surface)", color: "var(--color-primary)" }}
                  >
                    <TagIcon />
                  </span>
                  <span className="flex-1 text-sm" style={{ color: "var(--color-text-primary)" }}>
                    #{tag.name}
                    <span className="ml-1.5" style={{ color: "var(--color-text-muted)" }}>
                      · {tag.count} articles
                    </span>
                  </span>
                </Link>
              ))}
              <div className="mx-5 border-b" style={{ borderColor: "var(--color-border)" }} />
            </>
          )}

          {/* Article results — only when query is active */}
          {query.length > 0 && (
            allItems.filter((i) => i.type === "article").length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  No matches for &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                  Try: #prompting, #agents, #workflows
                </p>
              </div>
            ) : (
              matchingArticles.map((article, i) => {
                const globalIndex = matchingTags.length + i;
                return (
                  <Link
                    key={article.slug}
                    href={`/bricks/${article.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-5 py-3 transition-colors"
                    style={{
                      backgroundColor: selectedIndex === globalIndex ? "var(--color-surface)" : "transparent",
                    }}
                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                  >
                    <span
                      className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                      style={{ backgroundColor: "var(--color-surface)", color: "var(--color-text-secondary)" }}
                    >
                      {categoryIcon[article.category]}
                    </span>
                    <span className="flex-1 text-sm truncate" style={{ color: "var(--color-text-primary)" }}>
                      {article.title}
                    </span>
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                      style={{ backgroundColor: "var(--color-surface)", color: "var(--color-text-secondary)" }}
                    >
                      {categoryLabel[article.category]}
                    </span>
                  </Link>
                );
              })
            )
          )}

          {/* Footer */}
          {query.length > 0 && totalResults > matchingArticles.length && (
            <Link
              href={`/bricks?q=${encodeURIComponent(query)}`}
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 px-5 py-3 border-t text-sm font-medium transition-opacity hover:opacity-70"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-primary)",
              }}
            >
              See all {totalResults} results for &ldquo;{query}&rdquo; →
            </Link>
          )}

          {/* Empty state */}
          {query.length === 0 && (
            <div className="px-5 py-2 pb-3">
              <p className="text-[10px] uppercase tracking-widest font-semibold mb-2 pt-2" style={{ color: "var(--color-text-muted)" }}>
                Recent
              </p>
              {MOCK_ARTICLES.slice(0, 3).map((article, i) => (
                <Link
                  key={article.slug}
                  href={`/bricks/${article.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 py-2.5 transition-colors rounded-lg px-2"
                  style={{
                    backgroundColor: selectedIndex === i ? "var(--color-surface)" : "transparent",
                  }}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <span
                    className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                    style={{ backgroundColor: "var(--color-surface)", color: "var(--color-text-secondary)" }}
                  >
                    {categoryIcon[article.category]}
                  </span>
                  <span className="flex-1 text-sm truncate" style={{ color: "var(--color-text-secondary)" }}>
                    {article.title}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
