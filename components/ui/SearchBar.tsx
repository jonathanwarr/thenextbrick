"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  initialQuery?: string;
  size?: "hero" | "page";
}

type Category = "foundations" | "playbooks" | "essays";

type ArticleResult = {
  slug: string;
  title: string;
  category: Category;
  tags: string[];
  date: string;
};

type TagResult = {
  slug: string;
  name: string;
  count: number;
};

type SearchResults = {
  tags: TagResult[];
  articles: ArticleResult[];
  total: number;
};

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
function PlaybooksIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
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

const categoryIcon: Record<Category, React.ReactNode> = {
  foundations: <FoundationsIcon />,
  playbooks: <PlaybooksIcon />,
  essays: <EssaysIcon />,
};

const categoryLabel: Record<Category, string> = {
  foundations: "Foundations",
  playbooks: "Playbooks",
  essays: "Essays",
};

const EMPTY: SearchResults = { tags: [], articles: [], total: 0 };

export default function SearchBar({ initialQuery = "", size = "hero" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults(EMPTY);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = (await res.json()) as SearchResults;
          setResults(data);
          setSelectedIndex(0);
        }
      } catch (err) {
        if ((err as { name?: string })?.name !== "AbortError") {
          setResults(EMPTY);
        }
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setDropdownRect({ top: r.bottom + 8, left: r.left, width: r.width });
      }
    }
    if (isFocused) {
      measure();
      window.addEventListener("resize", measure);
      window.addEventListener("scroll", measure, true);
      return () => {
        window.removeEventListener("resize", measure);
        window.removeEventListener("scroll", measure, true);
      };
    }
  }, [isFocused]);

  useEffect(() => {
    itemRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedIndex]);

  const allItems = [
    ...results.tags.map((t) => ({ type: "tag" as const, data: t })),
    ...results.articles.map((a) => ({ type: "article" as const, data: a })),
  ];

  const showDropdown = isFocused && query.length > 0;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === "Enter") {
      if (allItems[selectedIndex]) {
        const item = allItems[selectedIndex];
        if (item.type === "tag") router.push(`/bricks?tag=${item.data.slug}`);
        else router.push(`/bricks/${item.data.slug}`);
        setIsFocused(false);
      } else if (query.trim()) {
        router.push(`/bricks?q=${encodeURIComponent(query)}`);
        setIsFocused(false);
      }
      return;
    }
    if (!showDropdown || allItems.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    }
  }

  const isHero = size === "hero";

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={`flex items-center gap-3 rounded-xl border transition-all ${
          isHero ? "px-7 py-4 lock:py-5.5" : "px-4 py-3"
        }`}
        style={{
          backgroundColor: "var(--color-surface-raised)",
          borderColor: isFocused ? "rgba(217,172,140,0.6)" : "var(--color-border)",
          outline: isFocused ? "1.5px solid rgba(217,172,140,0.6)" : "none",
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
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder="Search articles, tags or keywords"
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: "var(--color-text-primary)" }}
          aria-label="Search"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
        />
        <span className="hidden md:flex items-center gap-1 shrink-0 opacity-60">
          <kbd
            className="text-sm px-2.5 py-1 rounded border"
            style={{
              fontFamily: "var(--font-family-sans)",
              color: "var(--color-text-secondary)",
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            ⌘K
          </kbd>
        </span>
      </div>

      {showDropdown && dropdownRect && createPortal(
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsFocused(false)} />
          <div
            className="fixed z-[101] rounded-xl overflow-hidden shadow-lg border text-left"
            style={{
              top: dropdownRect.top,
              left: dropdownRect.left,
              width: dropdownRect.width,
              backgroundColor: "var(--color-surface-raised)",
              borderColor: "var(--color-border)",
            }}
          >
            {loading && allItems.length === 0 ? (
              <div className="px-5 py-6">
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Searching…
                </p>
              </div>
            ) : allItems.length === 0 ? (
              <div className="px-5 py-6">
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  No matches for &ldquo;{query}&rdquo;
                </p>
              </div>
            ) : (
              <div className="max-h-[320px] overflow-y-auto">
                {results.tags.map((tag, i) => (
                  <div key={tag.slug} ref={(el) => { itemRefs.current[i] = el; }}>
                    <Link
                      href={`/bricks?tag=${tag.slug}`}
                      onClick={() => setIsFocused(false)}
                      className="flex items-center gap-3 px-5 py-3 transition-colors"
                      style={{
                        backgroundColor: selectedIndex === i ? "var(--color-accent)" : "transparent",
                      }}
                      onMouseEnter={() => setSelectedIndex(i)}
                    >
                      <span
                        className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                        style={{ backgroundColor: "var(--color-surface)", color: "var(--color-primary)" }}
                      >
                        <TagIcon />
                      </span>
                      <span className="flex-1 text-sm" style={{ color: selectedIndex === i ? "var(--color-dark)" : "var(--color-text-primary)" }}>
                        #{tag.slug}
                        <span className="ml-1.5" style={{ color: selectedIndex === i ? "rgba(40,39,36,0.7)" : "var(--color-text-muted)" }}>
                          · {tag.count} {tag.count === 1 ? "article" : "articles"}
                        </span>
                      </span>
                    </Link>
                  </div>
                ))}

                {results.tags.length > 0 && results.articles.length > 0 && (
                  <div className="mx-5 border-b" style={{ borderColor: "var(--color-border)" }} />
                )}

                {results.articles.map((article, i) => {
                  const globalIndex = results.tags.length + i;
                  return (
                    <div key={article.slug} ref={(el) => { itemRefs.current[globalIndex] = el; }}>
                      <Link
                        href={`/bricks/${article.slug}`}
                        onClick={() => setIsFocused(false)}
                        className="flex items-center gap-3 px-5 py-3 transition-colors"
                        style={{
                          backgroundColor: selectedIndex === globalIndex ? "var(--color-accent)" : "transparent",
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <span
                          className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                          style={{ backgroundColor: "var(--color-surface)", color: "var(--color-text-secondary)" }}
                        >
                          {categoryIcon[article.category]}
                        </span>
                        <span className="flex-1 text-sm truncate" style={{ color: selectedIndex === globalIndex ? "var(--color-dark)" : "var(--color-text-primary)" }}>
                          {article.title}
                        </span>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: "var(--color-surface)", color: "var(--color-text-secondary)" }}
                        >
                          {categoryLabel[article.category]}
                        </span>
                      </Link>
                    </div>
                  );
                })}

                {results.total > results.articles.length && (
                  <Link
                    href={`/bricks?q=${encodeURIComponent(query)}`}
                    onClick={() => setIsFocused(false)}
                    className="flex items-center justify-center gap-1.5 px-5 py-3 border-t text-sm font-medium transition-opacity hover:opacity-70"
                    style={{
                      borderColor: "var(--color-border)",
                      color: "var(--color-primary)",
                    }}
                  >
                    See all {results.total} results for &ldquo;{query}&rdquo; →
                  </Link>
                )}
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
