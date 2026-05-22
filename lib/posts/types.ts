import type { Category } from "@/components/ui/BrickCard";

export type PostListItem = {
  id: string;
  slug: string;
  title: string;
  dek: string | null;
  publishedAt: Date | null;
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
  "builds",
  "observations",
  "essays",
];

export function categoryFromTags(tagSlugs: string[]): Category {
  for (const slug of tagSlugs) {
    if ((KNOWN_CATEGORIES as readonly string[]).includes(slug)) {
      return slug as Category;
    }
  }
  return "essays";
}
