import type { Category } from "@/components/ui/BrickCard";

export type PostListItem = {
  id: string;
  slug: string;
  title: string;
  dek: string | null;
  theBrick: string | null;
  publishedAt: Date | null;
  updatedAt: Date | null;
  readTimeMin: number | null;
  featured: boolean;
  category: Category;
  tags: string[];
};

export type PostDetail = PostListItem & {
  bodyMd: string;
  authorName: string | null;
};

export const KNOWN_CATEGORIES: readonly Category[] = [
  "foundations",
  "playbooks",
  "signals",
  "essays",
];

/**
 * Coerces the raw `posts.category` text (DB column, CHECK-constrained) to the
 * narrow `Category` union at the app boundary. Unknown/legacy values fall back
 * to "essays" so a bad row can never break rendering.
 */
export function normalizeCategory(value: string | null | undefined): Category {
  return (KNOWN_CATEGORIES as readonly string[]).includes(value ?? "")
    ? (value as Category)
    : "essays";
}
