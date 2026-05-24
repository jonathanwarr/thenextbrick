"use client";

import { useMemo, useState } from "react";

export type AvailableGroup = {
  id: string;
  name: string;
  sortOrder: number;
};

export type AvailableTag = {
  id: string;
  slug: string;
  name: string;
  groupId: string | null;
  sortOrder: number;
};

const UNGROUPED_ID = "__ungrouped__";

export default function TagPicker({
  groups,
  tags,
  initialSelected,
  name = "tags",
}: {
  groups: AvailableGroup[];
  tags: AvailableTag[];
  initialSelected: string[];
  name?: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialSelected),
  );
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  const orderedGroups = useMemo<AvailableGroup[]>(() => {
    const sorted = [...groups].sort((a, b) => a.sortOrder - b.sortOrder);
    const ungrouped = tags.filter((t) => !t.groupId);
    return ungrouped.length > 0
      ? [...sorted, { id: UNGROUPED_ID, name: "Other", sortOrder: Infinity }]
      : sorted;
  }, [groups, tags]);

  const tagsByGroup = useMemo(() => {
    const map = new Map<string, AvailableTag[]>();
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

  const selectedArray = useMemo(
    () => Array.from(selected),
    [selected],
  );

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function remove(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(slug);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {/* Hidden inputs — what the form submits */}
      {selectedArray.map((slug) => (
        <input key={slug} type="hidden" name={name} value={slug} />
      ))}

      {/* Selected chips */}
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {selectedArray.length === 0 ? (
          <span
            className="text-xs italic"
            style={{ color: "var(--color-text-muted)" }}
          >
            No tags selected.
          </span>
        ) : (
          selectedArray.map((slug) => {
            const tag = tagsBySlug.get(slug);
            return (
              <button
                key={slug}
                type="button"
                onClick={() => remove(slug)}
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
          })
        )}
      </div>

      {/* Group chips */}
      <div
        className="flex flex-wrap gap-1.5 pt-3 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        {orderedGroups.map((group) => {
          const isOpen = expandedGroupId === group.id;
          const groupTags = tagsByGroup.get(group.id) ?? [];
          const selectedCount = groupTags.filter((t) =>
            selected.has(t.slug),
          ).length;
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => setExpandedGroupId(isOpen ? null : group.id)}
              className="text-xs px-3 py-1 rounded-full font-medium border transition-colors cursor-pointer"
              style={{
                backgroundColor: isOpen
                  ? "var(--color-primary)"
                  : "var(--color-surface)",
                color: isOpen
                  ? "var(--color-text-primary)"
                  : "var(--color-text-secondary)",
                borderColor: "var(--color-border)",
              }}
            >
              {group.name}
              {selectedCount > 0 && (
                <span className="ml-1.5 text-[10px] opacity-70">
                  ({selectedCount})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded group's tags */}
      {expandedGroupId && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(tagsByGroup.get(expandedGroupId) ?? []).map((tag) => {
            const isSelected = selected.has(tag.slug);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggle(tag.slug)}
                className="text-xs px-3 py-1 rounded-full transition-colors cursor-pointer"
                style={{
                  backgroundColor: isSelected
                    ? "var(--color-primary)"
                    : "var(--color-bg)",
                  color: isSelected
                    ? "var(--color-text-primary)"
                    : "var(--color-text-secondary)",
                  border: "1px solid",
                  borderColor: isSelected
                    ? "var(--color-primary)"
                    : "var(--color-border)",
                }}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
