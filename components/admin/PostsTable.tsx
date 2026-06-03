"use client";

import { useState } from "react";
import Link from "next/link";
import { formatFullDate } from "@/lib/posts/format";
import { categoryLabels } from "@/components/ui/BrickCard";
import { normalizeCategory } from "@/lib/posts/types";
import { setFeatured } from "@/app/admin/posts/actions";

export type AdminPostRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  featured: boolean;
  category: string;
  published_at: string | null;
  updated_at: string;
};

type SortKey = "title" | "status" | "category" | "published" | "updated";

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "title", label: "Title" },
  { key: "status", label: "Status" },
  { key: "category", label: "Category" },
  { key: "published", label: "Published", numeric: true },
  { key: "updated", label: "Updated", numeric: true },
];

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function timeOf(value: string | null): number {
  return value ? new Date(value).getTime() : Number.NEGATIVE_INFINITY;
}

export default function PostsTable({ posts }: { posts: AdminPostRow[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "published",
    dir: "desc",
  });

  // The featured post is pinned to the top and exempt from sorting.
  const featured = posts.find((p) => p.featured) ?? null;
  const rest = posts.filter((p) => !p.featured);

  const sorted = [...rest].sort((a, b) => {
    const dir = sort.dir === "asc" ? 1 : -1;
    switch (sort.key) {
      case "title":
        return a.title.localeCompare(b.title) * dir;
      case "status":
        return a.status.localeCompare(b.status) * dir;
      case "category":
        return (
          categoryLabels[normalizeCategory(a.category)].localeCompare(
            categoryLabels[normalizeCategory(b.category)],
          ) * dir
        );
      case "published":
        return (timeOf(a.published_at) - timeOf(b.published_at)) * dir;
      case "updated":
        return (timeOf(a.updated_at) - timeOf(b.updated_at)) * dir;
    }
  });

  function toggleSort(key: SortKey) {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: COLUMNS.find((c) => c.key === key)?.numeric ? "desc" : "asc" },
    );
  }

  const ordered = featured ? [featured, ...sorted] : sorted;

  return (
    <table className="w-full text-sm">
      <thead style={{ backgroundColor: "var(--color-surface)" }}>
        <tr>
          <th className="w-10 px-2 py-3" aria-label="Featured" />
          {COLUMNS.map((col) => {
            const active = sort.key === col.key;
            return (
              <th
                key={col.key}
                className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider"
                style={{ color: active ? "var(--color-text-secondary)" : "var(--color-text-muted)" }}
              >
                <button
                  type="button"
                  onClick={() => toggleSort(col.key)}
                  className="inline-flex items-center gap-1 uppercase tracking-wider cursor-pointer hover:opacity-70"
                >
                  {col.label}
                  <span className="text-[9px]" aria-hidden="true">
                    {active ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}
                  </span>
                </button>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {ordered.map((post) => (
          <tr
            key={post.id}
            className="border-t"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: post.featured ? "var(--color-surface)" : undefined,
            }}
          >
            <td className="px-2 py-3 text-center">
              <form action={setFeatured} className="inline-flex">
                <input type="hidden" name="id" value={post.id} />
                <input type="hidden" name="featured" value={post.featured ? "false" : "true"} />
                <button
                  type="submit"
                  className="p-1 rounded transition-opacity hover:opacity-70 cursor-pointer"
                  style={{
                    color: post.featured ? "var(--color-primary)" : "var(--color-text-muted)",
                  }}
                  title={post.featured ? "Featured — click to clear" : "Make featured"}
                  aria-label={post.featured ? "Featured — click to clear" : "Make featured"}
                >
                  <StarIcon filled={post.featured} />
                </button>
              </form>
            </td>
            <td className="px-4 py-3">
              <Link href={`/admin/posts/${post.id}`} className="font-medium hover:opacity-70">
                {post.title}
              </Link>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                /bricks/{post.slug}
              </p>
            </td>
            <td className="px-4 py-3">
              <span
                className="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor:
                    post.status === "published"
                      ? "var(--color-primary)"
                      : post.status === "scheduled"
                        ? "var(--color-secondary)"
                        : "var(--color-surface)",
                  color: "var(--color-text-primary)",
                }}
              >
                {post.status}
              </span>
            </td>
            <td className="px-4 py-3">
              <span
                className="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {categoryLabels[normalizeCategory(post.category)]}
              </span>
            </td>
            <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
              {post.published_at ? formatFullDate(new Date(post.published_at)) : "—"}
            </td>
            <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
              {formatFullDate(new Date(post.updated_at))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
