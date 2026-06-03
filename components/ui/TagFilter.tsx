"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type TagFilterGroup = {
  id: string;
  name: string;
  sortOrder: number;
};

export type TagFilterTag = {
  id: string;
  slug: string;
  name: string;
  groupId: string | null;
  sortOrder: number;
};

const UNGROUPED_ID = "__ungrouped__";

/**
 * Public, browse-and-filter version of the admin TagPicker: pick a category to
 * reveal its tags, then select one or more tags to filter the Articles list.
 * Selection is driven through repeated `?tag=` URL params so it stays
 * server-rendered and shareable. Multiple tags match by union (any selected
 * tag), per the listPublishedPosts backend.
 */
export default function TagFilter({
  groups,
  tags,
  activeTags,
}: {
  groups: TagFilterGroup[];
  tags: TagFilterTag[];
  activeTags: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderedGroups = useMemo<TagFilterGroup[]>(() => {
    const sorted = [...groups].sort((a, b) => a.sortOrder - b.sortOrder);
    const ungrouped = tags.filter((t) => !t.groupId);
    return ungrouped.length > 0
      ? [...sorted, { id: UNGROUPED_ID, name: "Other", sortOrder: Infinity }]
      : sorted;
  }, [groups, tags]);

  const tagsByGroup = useMemo(() => {
    const map = new Map<string, TagFilterTag[]>();
    for (const tag of tags) {
      const key = tag.groupId ?? UNGROUPED_ID;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tag);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return map;
  }, [tags]);

  const tagsBySlug = useMemo(
    () => new Map(tags.map((t) => [t.slug, t])),
    [tags],
  );

  const activeSet = useMemo(() => new Set(activeTags), [activeTags]);

  // Open the first active tag's category on first render so selections show in context.
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(() => {
    const firstActive = tags.find((t) => activeTags.includes(t.slug));
    return firstActive ? firstActive.groupId ?? UNGROUPED_ID : null;
  });

  function applyTags(next: string[]) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("tag");
    for (const slug of next) sp.append("tag", slug);
    sp.delete("page"); // tag change resets pagination
    const qs = sp.toString();
    router.push(qs ? `/bricks?${qs}` : "/bricks");
  }

  function toggle(slug: string) {
    const next = new Set(activeSet);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    applyTags(Array.from(next));
  }

  return (
    <div className="space-y-3">
      {/* Selected tray */}
      <div className="flex flex-wrap items-center gap-1.5 min-h-[28px]">
        {activeTags.length === 0 ? (
          <span className="text-xs italic" style={{ color: "var(--color-text-muted)" }}>
            Showing all articles.
          </span>
        ) : (
          <>
            {activeTags.map((slug) => {
              const tag = tagsBySlug.get(slug);
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => toggle(slug)}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-opacity hover:opacity-80 cursor-pointer"
                  style={{
                    backgroundColor: "var(--color-tag-bg)",
                    color: "var(--color-tag-text)",
                  }}
                  aria-label={`Remove ${tag?.name ?? slug}`}
                >
                  {tag?.name ?? slug}
                  <span aria-hidden="true">×</span>
                </button>
              );
            })}
            {activeTags.length > 1 && (
              <button
                type="button"
                onClick={() => applyTags([])}
                className="text-xs px-1.5 py-1 transition-opacity hover:opacity-70 cursor-pointer"
                style={{ color: "var(--color-text-muted)" }}
              >
                Clear all
              </button>
            )}
          </>
        )}
      </div>

      {/* Category chips */}
      <div
        className="flex flex-wrap gap-1.5 pt-3 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        {orderedGroups.map((group) => {
          const isOpen = expandedGroupId === group.id;
          const groupTags = tagsByGroup.get(group.id) ?? [];
          const selectedCount = groupTags.filter((t) => activeSet.has(t.slug)).length;
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => setExpandedGroupId(isOpen ? null : group.id)}
              className="text-xs px-3 py-1 rounded-full font-medium border transition-colors cursor-pointer"
              style={{
                backgroundColor: isOpen ? "var(--color-primary)" : "var(--color-surface)",
                color: isOpen ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                borderColor: "var(--color-border)",
              }}
            >
              {group.name}
              {selectedCount > 0 && (
                <span className="ml-1.5 text-[10px] opacity-70">({selectedCount})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded category's tags */}
      {expandedGroupId && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(tagsByGroup.get(expandedGroupId) ?? []).map((tag) => {
            const isSelected = activeSet.has(tag.slug);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggle(tag.slug)}
                className="text-xs px-3 py-1 rounded-full transition-colors cursor-pointer"
                style={{
                  backgroundColor: isSelected ? "var(--color-primary)" : "var(--color-bg)",
                  color: isSelected ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  border: "1px solid",
                  borderColor: isSelected ? "var(--color-primary)" : "var(--color-border)",
                }}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      )}

      {/* How-to hint */}
      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
        Click a category to browse &amp; select tags
      </p>
    </div>
  );
}
